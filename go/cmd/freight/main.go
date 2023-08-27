package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	ckafka "github.com/confluentinc/confluent-kafka-go/kafka"
	_ "github.com/go-sql-driver/mysql"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/thiagoleet/imersao-fullcycle/go/internal/freight/entity"
	"github.com/thiagoleet/imersao-fullcycle/go/internal/freight/infra/repository"
	"github.com/thiagoleet/imersao-fullcycle/go/internal/freight/usecase"
	"github.com/thiagoleet/imersao-fullcycle/go/pkg/kafka"
)

var (
	routesCreated = prometheus.NewCounter(
		prometheus.CounterOpts{
			Name: "routes_created_total",
			Help: "Total number of created routes",
		},
	)

	routesStarted = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "routes_started_total",
			Help: "Total number of started routes",
		},
		[]string{"status"},
	)

	errorsTotal = prometheus.NewCounter(
		prometheus.CounterOpts{
			Name: "errors_total",
			Help: "Total number of errors",
		},
	)
)

func init() {
	prometheus.MustRegister(routesStarted)
	prometheus.MustRegister(errorsTotal)
	prometheus.MustRegister(routesCreated)
}

func main() {
	fmt.Println("Iniciando a aplicação GO")

	const driverName = "mysql"
	const dataSourceName = "root:root@tcp(host.docker.internal:3306)/routes?parseTime=true"
	db, err := sql.Open(driverName, dataSourceName)

	if err != nil {
		fmt.Println("Falha ao conectar ao banco de dados")
		panic(err)
	}
	defer db.Close()

	fmt.Println("Iniciando o Prometheus")
	http.Handle("/metrics", promhttp.Handler()) // servidor HTTP do Prometheus
	go http.ListenAndServe(":8080", nil)

	msgChan := make(chan *ckafka.Message)
	topics := []string{"route"}
	servers := "host.docker.internal:9094"

	fmt.Println("Inciando o consumo das mensagens no Kafka")
	go kafka.Consume(topics, servers, msgChan)

	repository := repository.NewRouteRepositoryMysql(db)
	freight := entity.NewFreight(10)
	createRouteUseCase := usecase.NewCreateRouteUseCase(repository, *freight)
	changeRouteStatusUseCase := usecase.NewChangeRouteStatusUseCase(repository)

	for msg := range msgChan {
		input := usecase.CreateRouteInput{}
		json.Unmarshal(msg.Value, &input)

		switch input.Event {
		case "RouteCreated":
			output, err := createRouteUseCase.Execute(input)
			if err != nil {
				fmt.Println(err)
				errorsTotal.Inc()
			} else {
				routesCreated.Inc()
				fmt.Println(output)
			}
		case "RouteStarted":
			input := usecase.ChangeRouteStatusInput{}
			json.Unmarshal(msg.Value, &input)

			output, err := changeRouteStatusUseCase.Execute(input)
			if err != nil {
				fmt.Println(err)
				errorsTotal.Inc()
			} else {
				routesStarted.WithLabelValues("started").Inc()
				fmt.Println(output)
			}
		case "RouteFinished":
			input := usecase.ChangeRouteStatusInput{}
			json.Unmarshal(msg.Value, &input)

			output, err := changeRouteStatusUseCase.Execute(input)
			if err != nil {
				fmt.Println(err)
				errorsTotal.Inc()
			} else {
				fmt.Println(output)
				routesStarted.WithLabelValues("finished").Inc()
			}
		}
	}

}
