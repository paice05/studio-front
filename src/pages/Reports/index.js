import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import subDays from "date-fns/subDays";
import addDays from "date-fns/addDays";
import format from "date-fns/format";
import { AddCircle, Delete } from "@material-ui/icons";

import MonetizationOn from "@material-ui/icons/MonetizationOn";
import Schedule from "@material-ui/icons/Schedule";
import AccountBox from "@material-ui/icons/AccountBox";
import { makeStyles } from "@material-ui/core";

import Card from "../../components/Card/Card";
import CardFooter from "../../components/Card/CardFooter";
import { Skeleton } from "../../components/Skeleton";
import CardHeader from "../../components/Card/CardHeader";
import CardIcon from "../../components/Card/CardIcon";
import GridContainer from "../../components/Grid/GridContainer";
import GridItem from "../../components/Grid/GridItem";
import Button from "../../components/CustomButtons/Button";
import CardBody from "../../components/Card/CardBody";
import Table from "../../components/Table/Table";
import { Loading } from "../../components/Loading";
import CustomInput from "../../components/CustomInput/CustomInput";
import { useAsync } from "../../hooks/useAsync";
import { useForm } from "../../hooks/useForm";
import { useToggle } from "../../hooks/useToggle";
import { reportsResource } from "../../services/reports";
import { useAuthContext } from "../../context/Auth";

import styles from "../../assets/jss/material-dashboard-react/views/dashboardStyle.js";
import { Helmet } from "../../components/Helmet";
import { NavLink } from "react-router-dom";

const useStyles = makeStyles(styles);

const initialValues = {
  startAt: "",
  endAt: "",
};

export function Reports() {
  const classes = useStyles();

  const { execute, value, status } = useAsync(reportsResource.reports);
  const { execute: execDestroy, status: statusDestroy } = useAsync(
    reportsResource.destroyById
  );

  const { user } = useAuthContext();

  const history = useHistory();

  const [fields, setField, setAllFields] = useForm(initialValues);

  const [openDetailsEntry, handleToggleOpenDetailsEntry] = useToggle();
  const [openDetailsOut, handleToggleOpenDetailsOut] = useToggle();

  const isSaleAccount = user?.account?.type === "sales";

  const handleSubmit = () => {
    const startAt = fields.startAt.split("-");
    const endAt = fields.endAt.split("-");

    const payload = {
      startAt: new Date(`${startAt[1]}-${startAt[2]}-${startAt[0]}`).setHours(
        0
      ),
      endAt: new Date(`${endAt[1]}-${endAt[2]}-${endAt[0]}`).setHours(23),
      type: isSaleAccount ? "sales" : "schedules",
    };

    execute(payload);
  };

  const handleDestroyById = (id) => {
    execDestroy(id);
  };

  const formatPrice = (value = 0) => {
    if (!value) return 0;

    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleLoadData = () => {
    const currentDate = new Date();

    const getCurrentDay = currentDate.getDay();

    const rigth = 7 - (getCurrentDay + 1);
    const left = getCurrentDay;

    const response = [
      ...Array.from({ length: left })
        .map((item, index) => subDays(currentDate, index + 1))
        .reverse(),
      currentDate,
      ...Array.from({ length: rigth }).map((item, index) =>
        addDays(currentDate, index + 1)
      ),
    ];

    execute({
      startAt: response[0].setHours(0),
      endAt: response[6].setHours(23),
      type: isSaleAccount ? "sales" : "schedules",
    });

    setAllFields({
      startAt: format(response[0], "yyyy-MM-dd"),
      endAt: format(response[6], "yyyy-MM-dd"),
    });
  };

  useEffect(() => {
    handleLoadData();
  }, []);

  useEffect(() => {
    if (statusDestroy === "success") handleLoadData();
  }, [statusDestroy]);

  const handleRealPrice = (total = 0, discount = 0, addition = 0) => {
    let subtotal = total;

    if (discount) {
      subtotal -= discount;
    }

    if (addition) {
      subtotal += addition;
    }

    return subtotal;
  };

  const isSales = user?.account?.type === "sales";

  return (
    <div>
      <Helmet title="Relat??rios" />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h4> Relat??rios </h4>
        <NavLink to="/reports/create">
          <Button color="info">
            <AddCircle className={classes.icons} /> registro de sa??da
          </Button>
        </NavLink>
      </div>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardHeader color="warning">
              <h4 className={classes.cardTitleWhite}>Relat??rios</h4>
              <p className={classes.cardCategoryWhite}>
                Escolha os filtros para buscar seus relat??rios
              </p>
            </CardHeader>
            <CardBody>
              <GridContainer>
                <GridItem xs={6} sm={6} md={6}>
                  <CustomInput
                    id="startAt"
                    formControlProps={{
                      fullWidth: true,
                    }}
                    inputProps={{
                      type: "date",
                      value: fields.startAt,
                      onChange: (event) =>
                        setField("startAt", event.target.value),
                    }}
                  />
                </GridItem>
                <GridItem xs={6} sm={6} md={6}>
                  <CustomInput
                    id="endAt"
                    formControlProps={{
                      fullWidth: true,
                    }}
                    inputProps={{
                      type: "date",
                      value: fields.endAt,
                      onChange: (event) =>
                        setField("endAt", event.target.value),
                    }}
                  />
                </GridItem>
              </GridContainer>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button onClick={handleSubmit}> Buscar relat??rio </Button>
              </div>
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>

      <GridContainer>
        <GridItem xs={12} sm={6} md={6}>
          <GridContainer>
            <GridItem xs={12} sm={isSales ? 12 : 6} md={isSales ? 12 : 6}>
              {status === "pending" ? (
                <div style={{ marginBottom: 60 }}>
                  <Skeleton lines={2} />
                </div>
              ) : (
                <Card>
                  <CardHeader color="success" stats icon>
                    <CardIcon
                      color="success"
                      onClick={handleToggleOpenDetailsEntry}
                    >
                      <MonetizationOn />
                    </CardIcon>
                    <p className={classes.cardCategory}>Entradas</p>
                    <h3 className={classes.cardTitle}>
                      {formatPrice(value?.entry)}
                    </h3>
                  </CardHeader>
                  <CardFooter stats>
                    <div className={classes.stats}></div>

                    {openDetailsEntry && (
                      <Table
                        tableHeaderColor="info"
                        tableHead={["Servi??o", "Valor"]}
                        tableData={(value?.schedulesInfo || []).map((item) => [
                          item.schedule.service.name,
                          handleRealPrice(
                            item.schedule.service.price,
                            item.schedule.discount,
                            item.schedule.addition
                          ),
                        ])}
                      />
                    )}
                  </CardFooter>
                </Card>
              )}
            </GridItem>

            <GridItem xs={12} sm={isSales ? 12 : 6} md={isSales ? 12 : 6}>
              {status === "pending" ? (
                <div style={{ marginBottom: 60 }}>
                  <Skeleton lines={2} />
                </div>
              ) : (
                <Card>
                  <CardHeader color="danger" stats icon>
                    <CardIcon
                      color="danger"
                      onClick={handleToggleOpenDetailsOut}
                    >
                      <MonetizationOn />
                    </CardIcon>
                    <p className={classes.cardCategory}>Sa??das</p>
                    <h3 className={classes.cardTitle}>
                      {formatPrice(value?.out)}
                    </h3>
                  </CardHeader>
                  <CardFooter stats>
                    <div className={classes.stats}></div>

                    {openDetailsOut && (
                      <Table
                        tableHeaderColor="info"
                        tableHead={["Descri????o", "Valor", "A????o"]}
                        tableData={(value?.registerInfo || []).map((item) => [
                          item.description,
                          item.out,
                          <Button
                            key={item.id}
                            color="danger"
                            justIcon={window.innerWidth > 959}
                            simple={!(window.innerWidth > 959)}
                            aria-label="Dashboard"
                            className={classes.buttonLink}
                            onClick={() => handleDestroyById(item.id)}
                          >
                            <Delete className={classes.icons} />
                          </Button>,
                        ])}
                      />
                    )}
                  </CardFooter>
                </Card>
              )}
            </GridItem>
          </GridContainer>

          {user?.account?.type === "sales" ? null : (
            <GridContainer>
              <GridItem xs={12} sm={6} md={6}>
                {status === "pending" ? (
                  <div style={{ marginBottom: 60 }}>
                    <Skeleton lines={2} />
                  </div>
                ) : (
                  <Card>
                    <CardHeader color="success" stats icon>
                      <CardIcon color="success">
                        <Schedule />
                      </CardIcon>
                      <p className={classes.cardCategory}>
                        Agendamentos confirmados
                      </p>
                      <h3 className={classes.cardTitle}>
                        {value?.countFinished || 0}
                      </h3>
                    </CardHeader>
                    <CardFooter stats>
                      <div className={classes.stats}></div>
                    </CardFooter>
                  </Card>
                )}
              </GridItem>

              <GridItem xs={12} sm={6} md={6}>
                {status === "pending" ? (
                  <div style={{ marginBottom: 60 }}>
                    <Skeleton lines={2} />
                  </div>
                ) : (
                  <Card>
                    <CardHeader color="danger" stats icon>
                      <CardIcon color="danger">
                        <Schedule />
                      </CardIcon>
                      <p className={classes.cardCategory}>
                        Agendamentos cancelados
                      </p>
                      <h3 className={classes.cardTitle}>
                        {value?.countCanceled || 0}
                      </h3>
                    </CardHeader>
                    <CardFooter stats>
                      <div className={classes.stats}></div>
                    </CardFooter>
                  </Card>
                )}
              </GridItem>
            </GridContainer>
          )}

          {user?.account?.type === "sales" ? null : (
            <GridContainer>
              <GridItem xs={12} sm={6} md={6}>
                {status === "pending" ? (
                  <div style={{ marginBottom: 60 }}>
                    <Skeleton lines={2} />
                  </div>
                ) : (
                  <Card>
                    <CardHeader color="info" stats icon>
                      <CardIcon color="info">
                        <AccountBox />
                      </CardIcon>
                      <p className={classes.cardCategory}>Novos clientes</p>
                      <h3 className={classes.cardTitle}>
                        {" "}
                        {value?.countUsers || 0}
                      </h3>
                    </CardHeader>
                    <CardFooter stats>
                      <div className={classes.stats}></div>
                    </CardFooter>
                  </Card>
                )}
              </GridItem>

              <GridItem xs={12} sm={6} md={6}>
                {status === "pending" ? (
                  <div style={{ marginBottom: 60 }}>
                    <Skeleton lines={2} />
                  </div>
                ) : (
                  <Card>
                    <CardHeader color="info" stats icon>
                      <CardIcon color="info">
                        <MonetizationOn />
                      </CardIcon>
                      <p className={classes.cardCategory}>
                        Sugest??o compra de produtos
                      </p>
                      <h3 className={classes.cardTitle}>
                        {" "}
                        {formatPrice(value?.productPriceSugestion)}
                      </h3>
                    </CardHeader>
                    <CardFooter stats>
                      <div className={classes.stats}></div>
                    </CardFooter>
                  </Card>
                )}
              </GridItem>
            </GridContainer>
          )}
        </GridItem>

        {user?.account?.type === "sales" ? null : (
          <GridItem xs={12} sm={6} md={6}>
            {status === "pending" ? (
              <Skeleton lines={5} />
            ) : (
              <Card>
                <CardHeader color="warning">
                  <h4 className={classes.cardTitleWhite}>
                    Servi??os mais procurados
                  </h4>
                  <p className={classes.cardCategoryWhite}>
                    acompanhe os servi??os mais procuras
                  </p>
                </CardHeader>
                <CardBody>
                  <Table
                    tableHeaderColor="warning"
                    tableHead={["Posi????o", "Nome", "Quantidade"]}
                    tableData={
                      value?.serviceCount.map((item, index) => [
                        index + 1,
                        item.name,
                        item.value,
                      ]) || []
                    }
                  />
                </CardBody>
              </Card>
            )}
          </GridItem>
        )}
      </GridContainer>
    </div>
  );
}
