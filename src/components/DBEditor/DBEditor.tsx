import React, { useState, useEffect, useCallback, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableFooter from "@mui/material/TableFooter";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import Button from "@mui/material/Button";
import { styled } from "@mui/system";

import DBSelect from "./DBSelect";
import DBEMenu from "./DBEMenu";
import AddTableDialog from "./AddTableDialog";
import RemoveTableDialog from "./RemoveTableDialog";
import AddColumnDialog from "./AddColumnDialog";
import RemoveColumnDialog from "./RemoveColumnDialog";
import RenameTableDialog from "./RenameTableDialog";
import RenameColumnDialog from "./RenameColumnDialog";
import { useAuthContext, UserInfo, instanceofUserInfo, convertToUserInfo } from '../AuthStore';

import {
  getTables,
  getTableData,
  updateElement,
  createNewTable,
  dropTable,
  renTable,
  createCol,
  renameCol,
  createNewRow,
  deleteRow,
  dropCol,
} from "../../api";
import { SelectChangeEvent } from "@mui/material";
import ExportTablesButtons from "./ExportTablesButtons";

export interface CurrentSelection {
  id: string,
  columnName: string,
  value: string | ReactNode,
  tableName: string,
  anchorEl: HTMLElement | null
};

interface TPActionsProps {
  count: number,
  page: number,
  rowsPerPage: number,
  onPageChange: Function
}

function TablePaginationActions(props: TPActionsProps) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event: any) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event: any) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event: any) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event: any) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowRight />
        ) : (
          <KeyboardArrowLeft />
        )}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowLeft />
        ) : (
          <KeyboardArrowRight />
        )}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

// const StyledIdTableCell = styled(TableCell, {
//   name: "StyledIdTableCell",
//   slot: "Wrapper",
// })({
//   "&:hover": {
//     backgroundColor: "background.lightGray",
//   },
// });

const StyledTableCell = styled(TableCell, {
  name: "StyledTableCell",
  slot: "Wrapper",
})({
  backgroundColor: "white",
  cursor: "pointer",
  "&:hover": {
    cursor: "pointer",
    backgroundColor: "lightGray",
  },
});

const StyledTableHeaderGrid = styled(Grid, {
  name: "StyledTableHeaderGrid",
  slot: "Wrapper",
})({
  marginTop: "50px",
  backgroundColor: "lightGray",
  padding: 4,
});

const StyledHeaderGrid = styled(Box)({
  marginTop: "50px",
  padding: 4,
  justifyContent: "center",
  alignContent: "center",
  display: "block"
});

interface AnchorPoint {
  x: number,
  y: number,
  anchorEl?: HTMLTableCellElement
}

const defaultAnchorPoint: AnchorPoint = { x: 0, y: 0 }

const currentSelectionSeed: CurrentSelection = { id: "", columnName: "", value: "", tableName: "", anchorEl: null }

export default function CustomPaginationActionsTable() {
  const [auth, setAuth] = useAuthContext();

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [columnHeaders, setColumnHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<HTMLTableCellElement[] | null>(null);
  const [tables, setTables] = useState<string[]>([]);
  const [showAddTblDlg, setShowAddTblDlg] = useState<boolean>(false);
  const [showRemoveTblDlg, setShowRemoveTblDlg] = useState<boolean>(false);
  const [showRenameTblDlg, setShowRenameTblDlg] = useState<boolean>(false);
  const [showAddColDlg, setShowAddColDlg] = useState<boolean>(false);
  const [showDeleteColDlg, setShowDeleteColDlg] = useState<boolean>(false);
  const [showRenameColDlg, setShowRenameColDlg] = useState<boolean>(false);

  const [anchorPoint, setAnchorPoint] = useState<AnchorPoint>(defaultAnchorPoint);
  const [showDBEMenu, setShowDBEMenu] = useState<boolean>(false);
  const [currentSelection, setCurrentSelection] = useState<CurrentSelection>(currentSelectionSeed);
  const [updateTable, setUpdateTable] = useState<boolean>(false);

  let navigate = useNavigate();

  const equalsIgnoreOrder = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false;
    const uniqueValues = new Set([...a, ...b]);
    for (const v of uniqueValues) {
      const aCount = a.filter((e: string) => e === v).length;
      const bCount = b.filter((e: string) => e === v).length;
      if (aCount !== bCount) return false;
    }
    return true;
  };

  useEffect(() => {
    if (!auth) {
      navigate("/login");
    }
    try {
      const user = { ...auth };
      if (user && !user.active) {
        navigate("/login");
      } else if (user.resetpwd) {
        navigate("/resetpassword");
      }
    } catch (err) {
      console.error(err);
      navigate("/login");
    }
  }, [auth, navigate]);

  useEffect(() => {
    const accessToken: string | null = localStorage.getItem("accessToken");
    if (accessToken) {
      getTables(accessToken)
        .then((response) => {
          console.log(response);
          return response;
        })
        .then((tableNames) => {
          if (Array.isArray(tableNames)) {
            if (!equalsIgnoreOrder(tables, tableNames)) {
              setTables(tableNames);
            }
          }
        });
    }
  }, [tables]);

  interface HDCC {
    event: React.MouseEvent<HTMLTableCellElement, MouseEvent>,
    id: string,
    colName: string,
    value: string | ReactNode,
    tableName: string
  }
  const handleDoubleClickCapture = useCallback(
    ({ event, id, colName, value, tableName }: HDCC) => {
      event?.preventDefault();
      let anchor = event.nativeEvent.currentTarget; //event.target;
      let columnName: string = colName;
      if (id === "header") {
        if (typeof value === "string") {
          columnName = value;
        } else {
          // TODO: Do this better
          columnName = "";
        }
        if (columnName === "id") {
          setShowDBEMenu(false);
          return;
        }
      }
      const newCS = {
        id: id,
        columnName: columnName,
        value: value,
        tableName: tableName,
        anchorEl: anchor as HTMLElement
      };
      setCurrentSelection(newCS);

      // const pos = getPosition(event?.currentTarget);
      // if (pos.x !== 0 && pos.y !== 0) {
      setAnchorPoint({
        // x: pos.x,
        // y: pos.y,
        x: event.pageX,
        y: event.pageY,
        anchorEl: event?.currentTarget, //(event.nativeEvent.currentTarget as HTMLTableCellElement), 
      });
      // }
      setShowDBEMenu(!showDBEMenu);
    },
    [setAnchorPoint, setShowDBEMenu, showDBEMenu]
  );

  useEffect(() => {
    if (updateTable) {
      setUpdateTable(false);
      if (!currentSelection) {
        setRows(null);
        return;
      }
      const table = currentSelection.tableName;
      getTableData(table).then((response: any) => {
        setRows(response.data);
        let headers: any[] = [];
        if (Array.isArray(response.columnNames)) {
          response.columnNames.forEach((element: string, index: number) => {
            return headers.push(
              <TableCell
                component="th"
                scope="row"
                key={index}
                sx={{
                  bgcolor: "#2F8F9D",
                  border: "2px",
                  "&:hover": {
                    cursor: "pointer",
                    backgroundColor: "#3BACB6",
                  },
                }}

                onDoubleClickCapture={(e: React.MouseEvent<HTMLTableCellElement, MouseEvent>) => handleDoubleClickCapture({
                  event: e,
                  id: "header",
                  colName: index.toString(),
                  value: element,
                  tableName: currentSelection.tableName
                })}
              >
                {element}
              </TableCell>
            );
          });
          setColumnHeaders(headers);
        }
      });
    }
  }, [currentSelection, updateTable, handleDoubleClickCapture]);

  function createRow(row: any) {
    const cells = [];
    for (const [key, value] of Object.entries(row)) {
      let keyValue = key + row.id;
      if (key === "id") {
        cells.push(
          <StyledTableCell
            key={keyValue}
            onDoubleClick={(e) =>
              handleDoubleClickCapture({
                event: e,
                id: row.id,
                colName: key,
                value: value as string,
                tableName: currentSelection.tableName
              })
            }
            component="th"
            scope="row"
          >
            {value as string}
          </StyledTableCell>
        );
      } else {
        cells.push(
          <StyledTableCell
            key={keyValue}
            onDoubleClick={(e) =>
              handleDoubleClickCapture({
                event: e,
                id: row.id,
                colName: key,
                value: value as string,
                tableName: currentSelection.tableName
              })
            }
            component="th"
            scope="row"
          >
            {value as string}
          </StyledTableCell>
        );
      }
    }
    return <TableRow key={row.id}>{cells}</TableRow>;
  }

  const handleTableChange = (evt: SelectChangeEvent<string>, child: React.ReactNode) => {
    if (!evt) return;
    const tableName = (child as any)?.props.value;
    if (currentSelection.tableName !== tableName || updateTable) {
      setCurrentSelection(createDefaultCurrentSelection(evt?.target as HTMLElement, tableName));
      setUpdateTable(true);
    }
  };

  const createDefaultCurrentSelection = (anchorEl: HTMLElement | null, name: string) => {
    const cs = { id: "0", columnName: "", value: "", tableName: name, anchorEl: anchorEl };
    return cs;
  };

  //------------------------------------------------

  // Avoid a layout jump when reaching the last page with empty rows.
  function getEmptyRows() {
    let length = 0;
    if (rows) {
      length = rows.length;
    }
    return page > 0 ? Math.max(0, (1 + page) * rowsPerPage - length) : 0;
  }

  function hasNoRows() {
    return rows?.length === 0;
  }

  const handleChangePage = (event: any, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  //------------------------------------------------

  //const closeMenu = (e: any) => {
  const closeMenu = () => {
    setShowDBEMenu(false);
  };

  const updateItem = (id: string, column: string, value: string) => {
    if (id === null) {
      closeMenu();
      return;
    }
    setShowDBEMenu(false);
    updateElement(currentSelection.tableName, id, column, value)
      .then((response) => {
        setCurrentSelection(
          createDefaultCurrentSelection(currentSelection.anchorEl, currentSelection.tableName)
        );
        setUpdateTable(true);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const showAddTableDialog = (show: boolean) => {
    setShowAddTblDlg(show);
  };

  const showRemoveTableDialog = (show: boolean) => {
    setShowRemoveTblDlg(show);
  };

  const showRenameTableDialog = (show: boolean) => {
    setShowRenameTblDlg(show);
  };

  const showCreateColumnDialog = (show: boolean) => {
    setShowAddColDlg(show);
  };

  const showRenameColumnDialog = (show: boolean) => {
    setShowRenameColDlg(show);
  };

  const showDeleteColumnDialog = (show: boolean) => {
    setShowDeleteColDlg(show);
  };

  const createTable = (tableName: string, columnName: string) => {
    createNewTable(tableName, columnName).then(function (response) {
      setTables([]);
      setCurrentSelection(createDefaultCurrentSelection(null, tableName));
      setUpdateTable(true);
      setShowDBEMenu(false);
    });
  };

  const deleteTable = (tableName: string) => {
    try {
      dropTable(tableName).then((result) => {
        setTables([]);
        setCurrentSelection(createDefaultCurrentSelection(null, ""));
        setUpdateTable(true);
        setShowDBEMenu(false);
      });
    } catch (err) {
      console.error(err);
    }
  };

  const renameTable = (oldTableName: string, newTableName: string) => {
    const accessToken: string | null = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert("No access token");
      return;
    }
    renTable(accessToken, oldTableName, newTableName).then((result) => {
      setTables([]);
      setCurrentSelection(createDefaultCurrentSelection(currentSelection.anchorEl, newTableName));
      setUpdateTable(true);
      setShowDBEMenu(false);
    });
  };

  const createColumn = (tableName: string, columnName: string, dataType: string) => {
    createCol(tableName, columnName, dataType).then((result) => {
      setCurrentSelection(createDefaultCurrentSelection(currentSelection.anchorEl, tableName));
      setUpdateTable(true);
      showCreateColumnDialog(false);
      setShowDBEMenu(false);
    });
  };

  const renameColumn = (tableName: string, newColumnName: string, oldColumnName: string) => {
    renameCol(tableName, oldColumnName, newColumnName)
      .then((result) => {
        setCurrentSelection(createDefaultCurrentSelection(currentSelection.anchorEl, tableName));
        setUpdateTable(true);
        setShowDBEMenu(false);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const createDBRow = () => {
    createNewRow(currentSelection.tableName).then((result) => {
      setCurrentSelection(
        createDefaultCurrentSelection(currentSelection.anchorEl, currentSelection.tableName)
      );
      setUpdateTable(true);
      setShowDBEMenu(false);
    });
  };

  const deleteDBRow = () => {
    deleteRow(currentSelection.tableName, currentSelection.id).then(
      (result) => {
        setCurrentSelection(
          createDefaultCurrentSelection(null, currentSelection.tableName)
        );
        setUpdateTable(true);
        setShowDBEMenu(false);
      }
    );
  };

  const deleteColumn = (columnName: string) => {
    try {
      dropCol(currentSelection.tableName, columnName).then((result) => {
        setCurrentSelection(
          createDefaultCurrentSelection(null, currentSelection.tableName)
        );
        setUpdateTable(true);
      });
    } catch (err) {
      console.error(err);
    } finally {
      setShowDBEMenu(false);
    }
  };

  const getGrid = () => {
    if (
      rows &&
      currentSelection.columnName === "id" &&
      !Number.isNaN(currentSelection.id)
    ) {
      return (
        <StyledHeaderGrid>
          {showDBEMenu ? (
            <DBEMenu
              x={anchorPoint.x}
              y={anchorPoint.y}
              anchorElement={anchorPoint.anchorEl}
              ui={() => updateItem}
              cs={currentSelection}
              ctd={() => showAddTableDialog}
              dt={() => setShowRemoveTblDlg}
              cc={() => showCreateColumnDialog}
              dc={() => showDeleteColumnDialog}
              rtd={() => showRenameTableDialog}
              rcd={() => showRenameColumnDialog}
              openMenuValue={showDBEMenu}
              setOpenMenuFn={() => setShowDBEMenu}
              addNewRow={() => createDBRow}
              removeRow={() => deleteDBRow}
            />
          ) : null}
          <Grid container>
            <Grid item xs={4} />
            <Grid item xs={4} style={{ display: "flex", gap: "1rem", alignItems: "center", alignContent: "center", justifyContent: "center" }}>
              <DBSelect 
                htc={(evt: SelectChangeEvent<string>, child: React.ReactNode) => handleTableChange(evt, child)} 
                tables={tables} 
                curSel={currentSelection.tableName} />
              <ExportTablesButtons />
            </Grid>
            <Grid item xs={4} />
          </Grid>
          
          <Grid item>
            <TableContainer component={Paper}>
              <Table
                sx={{ minWidth: 500 }}
                aria-label="custom pagination table"
              >
                <TableBody>
                  <TableRow>{columnHeaders}</TableRow>
                  {hasNoRows() && (
                    <TableRow style={{ height: 53 * getEmptyRows() }}>
                      <TableCell colSpan={6}>
                        No data in table{" "}
                        <Button onClick={createDBRow} variant="text">
                          Create a row
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}

                  {(rowsPerPage > 0
                    ? rows.slice(
                      page * rowsPerPage,
                      page * rowsPerPage + rowsPerPage
                    )
                    : rows
                  ).map(createRow)}

                  {getEmptyRows() > 0 && (
                    <TableRow style={{ height: 53 * getEmptyRows() }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[
                        5,
                        10,
                        25,
                        { label: "All", value: -1 },
                      ]}
                      colSpan={3}
                      count={rows.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      SelectProps={{
                        inputProps: {
                          "aria-label": "rows per page",
                        },
                        native: true,
                      }}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      ActionsComponent={TablePaginationActions}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </Grid>
        </StyledHeaderGrid>
      );
    } else if (rows && currentSelection.tableName) {
      return (
        <StyledHeaderGrid>
          {showDBEMenu ? (
            <DBEMenu
              x={anchorPoint.x}
              y={anchorPoint.y}
              anchorElement={anchorPoint.anchorEl}
              ui={() => updateItem}
              cs={currentSelection}
              ctd={() => showAddTableDialog}
              dt={() => setShowRemoveTblDlg}
              cc={() => showCreateColumnDialog}
              dc={() => showDeleteColumnDialog}
              rtd={() => showRenameTableDialog}
              rcd={() => showRenameColumnDialog}
              openMenuValue={showDBEMenu}
              setOpenMenuFn={() => setShowDBEMenu}
              addNewRow={() => { }}
              removeRow={() => { }}
            />
          ) : null}
          <AddTableDialog
            openDlg={showAddTblDlg ? showAddTblDlg : false}
            setOpen={() => showAddTableDialog}
            createCallback={() => createTable}
          />
          <RemoveTableDialog
            openDlg={showRemoveTblDlg ? showRemoveTblDlg : false}
            setOpen={() => showRemoveTableDialog}
            removeCallback={() => deleteTable}
            name={currentSelection.tableName}
          />
          <RenameTableDialog
            openDlg={showRenameTblDlg ? showRenameTblDlg : false}
            setOpen={() => showRenameTableDialog}
            renameCallback={() => renameTable}
            oldTableName={currentSelection.tableName}
          />
          <AddColumnDialog
            openDlg={showAddColDlg ? showAddColDlg : false}
            setOpen={() => showCreateColumnDialog}
            createCallback={() => createColumn}
            tableName={currentSelection.tableName}
          />
          <RemoveColumnDialog
            openDlg={showDeleteColDlg ? showDeleteColDlg : false}
            setOpen={() => showDeleteColumnDialog}
            removeCallback={() => deleteColumn}
            name={currentSelection ? currentSelection.columnName : ""}
          />
          <RenameColumnDialog
            openDlg={showRenameColDlg ? showRenameColDlg : false}
            setOpen={() => showRenameColumnDialog}
            renameCallback={() => renameColumn}
            tableName={currentSelection.tableName}
            oldColumnName={currentSelection.columnName}
          />

          <Grid container>
            <Grid item xs={4} />
            <Grid item xs={4} style={{ display: "flex", gap: "1rem", alignItems: "center", alignContent: "center", justifyContent: "center" }}>
              <DBSelect 
                htc={(evt: SelectChangeEvent<string>, child: React.ReactNode) => handleTableChange(evt, child)} 
                tables={tables} 
                curSel={currentSelection.tableName} />
              <ExportTablesButtons />
            </Grid>
            <Grid item xs={4} />
          </Grid>
          <Grid item>
            <TableContainer component={Paper}>
              <Table
                sx={{ minWidth: 500 }}
                aria-label="custom pagination table"
              >
                <TableBody>
                  <TableRow>{columnHeaders}</TableRow>
                  {hasNoRows() && (
                    <TableRow style={{ height: 53 * getEmptyRows() }}>
                      <TableCell colSpan={6}>
                        No data in table
                        <Button onClick={createDBRow} variant="text">
                          Create a row
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}

                  {(rowsPerPage > 0
                    ? rows.slice(
                      page * rowsPerPage,
                      page * rowsPerPage + rowsPerPage
                    )
                    : rows
                  ).map(createRow)}

                  {getEmptyRows() > 0 && (
                    <TableRow style={{ height: 53 * getEmptyRows() }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[
                        5,
                        10,
                        25,
                        { label: "All", value: -1 },
                      ]}
                      colSpan={3}
                      count={rows.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      SelectProps={{
                        inputProps: {
                          "aria-label": "rows per page",
                        },
                        native: true,
                      }}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      ActionsComponent={TablePaginationActions}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </Grid>
        </StyledHeaderGrid>
      );
    } else {
      return (
        <StyledHeaderGrid>
          <Grid container>
            <Grid item xs={4} />
            <Grid item xs={4} style={{ display: "flex", gap: "1rem", alignItems: "center", alignContent: "center", justifyContent: "center" }}>
              <DBSelect htc={(evt: SelectChangeEvent<string>, child: React.ReactNode) => handleTableChange(evt, child)} tables={tables} curSel="" />
              <ExportTablesButtons />
            </Grid>
            <Grid item xs={4} />
          </Grid>
        </StyledHeaderGrid>
      );
    }
  };

  return getGrid();

}
