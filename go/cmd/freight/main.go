package main

import (
	"database/sql"
	"encoding/json"
	"fmt"

	ckafka "github.com/confluentinc/confluent-kafka-go/kafka"
	_ "github.com/go-sql-driver/mysql"
	"github.com/thiagoleet/imersao-fullcycle/go/internal/freight/entity"
	"github.com/thiagoleet/imersao-fullcycle/go/internal/freight/infra/repository"
	"github.com/thiagoleet/imersao-fullcycle/go/internal/freight/usecase"
	"github.com/thiagoleet/imersao-fullcycle/go/pkg/kafka"
)

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
			}
			fmt.Println(output)
		case "RouteStarted", "RouteFinished":
			input := usecase.ChangeRouteStatusInput{}
			json.Unmarshal(msg.Value, &input)

			output, err := changeRouteStatusUseCase.Execute(input)
			if err != nil {
				fmt.Println(err)
			}
			fmt.Println(output)
		}
	}

}
