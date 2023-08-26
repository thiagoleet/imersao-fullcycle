package repository

import (
	"database/sql"
	"fmt"

	"github.com/thiagoleet/imersao-fullcycle/go/internal/freight/entity"
)

type RouteRepositoryMysql struct {
	db *sql.DB
}

func NewRouteRepositoryMysql(db *sql.DB) *RouteRepositoryMysql {
	return &RouteRepositoryMysql{
		db: db,
	}
}

func (r RouteRepositoryMysql) Create(route *entity.Route) error {
	fmt.Println("Criando rota: " + route.ID)
	query := "INSERT INTO routes (id, name, distance, status, freight_price) values (?,?,?,?,?)"
	_, err := r.db.Exec(query, route.ID, route.Name, route.Distance, route.StartedAt, route.FreightPrice)

	if err != nil {
		fmt.Println("Falha ao criar rota: " + route.Name)
		return err
	}
	return nil

}

func (r *RouteRepositoryMysql) FindByID(id string) (*entity.Route, error) {
	fmt.Println("Obtendo rota: " + id)
	query := "SELECT id, name, distance, status, freight_price, started_at, finished_at FROM routes WHERE id = ?"
	row := r.db.QueryRow(query, id)

	var startedAt, finishedAt sql.NullTime
	var route entity.Route

	err := row.Scan(
		&route.ID,
		&route.Name,
		&route.Distance,
		&route.Status,
		&route.FreightPrice,
		&startedAt,
		&finishedAt,
	)

	if err != nil {
		return nil, err
	}

	if startedAt.Valid {
		route.StartedAt = startedAt.Time
	}

	if finishedAt.Valid {
		route.FinishedAt = finishedAt.Time
	}

	return &route, nil
}

func (r *RouteRepositoryMysql) Update(route *entity.Route) error {
	fmt.Println(route.Status + " - Atualizando rota " + route.ID)
	startedAt := route.StartedAt.Format("2006-01-02 15:04:05")
	finishedAt := route.FinishedAt.Format("2006-01-02 15:04:05")

	query := "UPDATE routes SET status = ?, freight_price = ?, started_at = ?, finished_at = ? WHERE id = ?"
	_, err := r.db.Exec(query, route.Status, route.FreightPrice, startedAt, finishedAt, route.ID)

	if err != nil {
		fmt.Println("Falha ao atualizar rota")
		return err
	}

	return nil
}
