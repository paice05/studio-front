import React, { useEffect, useState } from "react";
import { NavLink, useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Delete from "@material-ui/icons/Delete";
import Edit from "@material-ui/icons/Edit";
import AddCircle from "@material-ui/icons/AddCircle";

import Table from "../../components/Table/Table";
import Card from "../../components/Card/Card";
import CardHeader from "../../components/Card/CardHeader";
import CardBody from "../../components/Card/CardBody";
import Button from "../../components/CustomButtons/Button";
import { useAsync } from "../../hooks/useAsync";
import { useToggle } from "../../hooks/useToggle";
import { categoryResource } from "../../services/categories";
import { Modal } from "../../components/Modal";

const styles = {
  cardCategoryWhite: {
    "&,& a,& a:hover,& a:focus": {
      color: "rgba(255,255,255,.62)",
      margin: "0",
      fontSize: "14px",
      marginTop: "0",
      marginBottom: "0",
    },
    "& a,& a:hover,& a:focus": {
      color: "#FFFFFF",
    },
  },
  cardTitleWhite: {
    color: "#FFFFFF",
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none",
    "& small": {
      color: "#777",
      fontSize: "65%",
      fontWeight: "400",
      lineHeight: "1",
    },
  },
};

const useStyles = makeStyles(styles);

export function Categories() {
  const classes = useStyles();

  const history = useHistory();

  const { execute, value } = useAsync(categoryResource.findMany);
  const { execute: deleteById, status: statusDelete, error } = useAsync(
    categoryResource.deleteById
  );

  const [isOpen, handleChangeIsOpen] = useToggle();
  const [isOpenError, handleChangeIsOpenError] = useToggle();

  const [userId, setUserId] = useState("");

  useEffect(() => {
    execute();
  }, []);

  useEffect(() => {
    if (statusDelete === "success") execute();
  }, [statusDelete]);

  useEffect(() => {
    if (
      error &&
      error.response.data.name === "SequelizeForeignKeyConstraintError"
    )
      handleChangeIsOpenError();
  }, [error]);

  const handleDeleteUser = (valueUserId) => {
    setUserId(valueUserId);
    handleChangeIsOpen();
  };

  const handleSubmitDelete = () => {
    deleteById(userId);
    handleChangeIsOpen();
  };

  console.log(error);

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h4> Categorias </h4>
        <NavLink to="/admin/categories/create">
          <Button color="info">
            <AddCircle className={classes.icons} /> nova categoria
          </Button>
        </NavLink>
      </div>
      <Card>
        <CardHeader color="info">
          <h4 className={classes.cardTitleWhite}>Lista de Categorias</h4>
          <p className={classes.cardCategoryWhite}>
            acompanhe todos os suas categorias por aqui.
          </p>
        </CardHeader>
        <CardBody>
          <Table
            tableHeaderColor="info"
            tableHead={["Nome", "Ações"]}
            tableData={(value || []).map((item) => [
              item.name,

              <div key={item.id}>
                <Button
                  color="warning"
                  justIcon={window.innerWidth > 959}
                  simple={!(window.innerWidth > 959)}
                  aria-label="Dashboard"
                  className={classes.buttonLink}
                  onClick={() =>
                    history.push(`/admin/categories/${item.id}/edit`)
                  }
                >
                  <Edit className={classes.icons} />
                </Button>
                <Button
                  color="danger"
                  justIcon={window.innerWidth > 959}
                  simple={!(window.innerWidth > 959)}
                  aria-label="Dashboard"
                  className={classes.buttonLink}
                  onClick={() => handleDeleteUser(item.id)}
                >
                  <Delete className={classes.icons} />
                </Button>
              </div>,
            ])}
          />
        </CardBody>

        <Modal
          type="warning"
          onCancel={handleChangeIsOpen}
          onConfirm={handleSubmitDelete}
          title="Deseja excluir esse item?"
          show={isOpen}
        >
          Cuidado! Não sera possível reverter essa ação!
        </Modal>

        <Modal
          type="error"
          onCancel={handleChangeIsOpenError}
          onConfirm={handleChangeIsOpenError}
          title="Não foi possível excluir!"
          show={isOpenError}
        >
          Esse item tem produtos vinculados
        </Modal>
      </Card>
    </div>
  );
}