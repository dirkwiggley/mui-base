import axios from "axios";
import jwt_decode from "jwt-decode";
import CONFIG from "./config";

import { UserInfo } from "./components/AuthStore";

const axiosJWT = axios.create();

// axiosJWT.interceptors.request.use(
//   async (config) => {
//     let currentDate = new Date();
//     const aT: any = localStorage.getItem("accessToken");
//     const accessToken: string = ((aT !== null) ? aT : "");
//     const rT: any = localStorage.getItem("refreshToken");
//     const refreshToken = ((rT !== null) ? rT : "");
//     const decodedToken: any = jwt_decode(accessToken);
//     if (decodedToken.exp * 1000 < currentDate.getTime()) {
//       const data = await refreshToken(refreshToken);
//       localStorage.setItem("accessToken", data.accessToken);
//       localStorage.setItem("refreshToken", data.refreshToken);
//       if (config && config.headers) {
//         config.headers["authorization"] = "Bearer " + data.accessToken;
//       }
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

export const loginApi = (login: string, pwd: string) => {
  return new Promise(function (resolve, reject) {
    axios
      .post(`${CONFIG.baseDbURL}/auth/`, { login: login, password: pwd }, { withCredentials: true })
      .then((response) => {
        if (response.data.error) {
          reject(response.data.error);
        } else {
          const user = { ...response.data };
          const roles = JSON.parse(user.roles);
          user.roles = roles;
          resolve(user);
        }
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
};

export const logoutApi = (userId: number) => {
  return new Promise(function (resolve, reject) {
    if (!userId) {
      console.error("Invalid userId");
      reject("Invalid user id");
    }
    axios
      .delete(`${CONFIG.baseDbURL}/auth/logout/${userId}`) 
      .then((response) => {
        if (response.data.error) {
          reject(response.data.error);
        } else {
          resolve("");
        }
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
};

export const refreshToken = (accessToken: string) => {
  const params = { accessToken: accessToken };
  return new Promise(function (resolve, reject) {
    axios
      .post(`${CONFIG.baseDbURL}/auth/refresh/`, params)
      .then((response) => {
        resolve("");
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
};

export const getUsers = () => {
  const accessToken = localStorage.getItem("accessToken");
  return new Promise<UserInfo[]>(function (resolve, reject) {
    axios
      .get(`${CONFIG.baseDbURL}/users/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((response) => {
        if (response.data.error) {
          reject(response.data.error);
        } else {
          resolve(response.data.users);
        }
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
};

export const getUser = (userId: number) => {
  return new Promise<UserInfo>(function (resolve, reject) {
    axios
      .get(`${CONFIG.baseDbURL}/users/id/${userId}`, { withCredentials: true })
      .then((response) => {
        if (response.data.error) {
          reject(response.data.error);
        } else {
          const user = response.data.user;
          const roles = JSON.parse(user.roles);
          user.roles = roles;
          resolve(response.data.user);
        }
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
};

export interface RoleType { name: string };

export const getRoles = () => {
  return new Promise<RoleType[]>(function (resolve, reject) {
    axios
      .get(`${CONFIG.baseDbURL}/roles/`, { withCredentials: true })
      .then((response) => {
        if (response.data.error) {
          reject(response.data.error);
        } else {
          resolve(response.data.roles);
        }
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
};

export const updateUser = (userInfo: any) => {
  return new Promise(function (resolve, reject) {
    axios
      .post(`${CONFIG.baseDbURL}/users/update/`, { userInfo: userInfo } , { withCredentials: true })
      .then((response) => {
        if (response.data.error) {
          reject(response.data.error);
        } else {
          resolve("");
        }
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
};

export const resetPassword = (userId: string, newPassword: string) => {
  return new Promise(function (resolve, reject) {
    const userInfo = { id: userId, password: newPassword };
    axios
      .post(`${CONFIG.baseDbURL}/auth/resetpassword/`, userInfo, { withCredentials: true })
      .then((response) => {
        if (response.data.error) {
          reject(response.data.error);
        } else {
          resolve("");
        }
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
};

export const getTableData = (tableName: string) => {
  return new Promise(function (resolve, reject) {
    axios
      .get(`${CONFIG.baseDbURL}/dbutils/tabledata/${tableName}`, { withCredentials: true })
      .then((response) => {
        if (response.data.error) {
          reject(response.data.error);
        } else {
          resolve(response.data);
        }
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
};

export const getTables = () => {
  return new Promise(function (resolve, reject) {
    axios
      .get(`${CONFIG.baseDbURL}/dbutils/tables`, { withCredentials: true })
      .then((response) => {
        if (response.data.error) {
          reject(response.data.error);
        } else {
          resolve(response.data);
        }
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
};

export const updateElement = (tableName: string, id: string, column: string, value: string) => {
  return new Promise(function (resolve, reject) {
    axios
      .get(
        `${CONFIG.baseDbURL}/dbutils/updateelement/${tableName}/${id}/${column}/${value}`, { withCredentials: true })
      .then((response) => {
        if (response.data.error) {
          reject(response.data.error);
        } else {
          resolve(response);
        }
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
};

// const url = URL_PREFIX + `/createtable/${tableName}/${columnName}`;
export const createNewTable = (tableName: string, columnName: string) => {
  const accessToken = localStorage.getItem("accessToken");
  return new Promise(function (resolve, reject) {
    axios
      .get(
        `${CONFIG.baseDbURL}/dbutils/createtable/${tableName}/${columnName}`, { withCredentials: true })
      .then((response) => {
        if (response.data.error) {
          reject(response.data.error);
        } else {
          resolve("");
        }
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
};

// const url = URL_PREFIX + `/droptable/${tableName}`;
export const dropTable = (tableName: string) => {
  const accessToken = localStorage.getItem("accessToken");
  return new Promise(function (resolve, reject) {
    axios
      .delete(`${CONFIG.baseDbURL}/dbutils/droptable/${tableName}`, { withCredentials: true })
      .then((response) => {
        if (response.data.error) {
          reject(response.data.error);
        } else {
          resolve("");
        }
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
};

// const url = URL_PREFIX + `/rename/table/${oldTableName}/${newTableName}`;
export const renTable = (accessToken: string, oldTableName: string, newTableName: string) => {
  return new Promise(function (resolve, reject) {
    axios
      .get(
        `${CONFIG.baseDbURL}/dbutils/rename/table/${oldTableName}/${newTableName}`, { withCredentials: true })
      .then((response) => {
        if (response.data.error) {
          reject(response.data.error);
        } else {
          resolve("");
        }
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
};

// const url = URL_PREFIX + `/createcolumn/${tableName}/${columnName}`;
export const createCol = (tableName: string, columnName: string, dataType: string) => {
  return new Promise(function (resolve, reject) {
    axios
      .get(
        `${CONFIG.baseDbURL}/dbutils/createcolumn/${tableName}/${columnName}/${dataType}`, { withCredentials: true })
      .then((response) => {
        if (response.data.error) {
          reject(response.data.error);
        } else {
          resolve("");
        }
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
};

// const url = URL_PREFIX + `/rename/${tableName}/column/${oldColumnName}/${newColumnName}`;
export const renameCol = (tableName: string, oldColumnName: string, newColumnName: string) => {
  return new Promise(function (resolve, reject) {
    axios
      .get(
        `${CONFIG.baseDbURL}/dbutils/rename/${tableName}/column/${oldColumnName}/${newColumnName}`, { withCredentials: true })
      .then((response) => {
        if (response.data.error) {
          reject(response.data.error);
        } else {
          resolve("");
        }
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
};

// const url = URL_PREFIX + `/insertrow/${currentSelection.tableName}`;
export const createNewRow = (tableName: string) => {
  return new Promise(function (resolve, reject) {
    axios
      .get(`${CONFIG.baseDbURL}/dbutils/insertrow/${tableName}`, { withCredentials: true })
      .then((response) => {
        if (response.data.error) {
          reject(response.data.error);
        } else {
          resolve("");
        }
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
};

// const url = URL_PREFIX + '/deleterow/:table/:id'
export const deleteRow = (tableName: string, rowId: string) => {
  return new Promise(function (resolve, reject) {
    axios
      .delete(`${CONFIG.baseDbURL}/dbutils/deleterow/${tableName}/${rowId}`, { withCredentials: true })
      .then((response) => {
        if (response.data.error) {
          reject(response.data.error);
        } else {
          resolve(response.data);
        }
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
};

//const url = URL_PREFIX + `/dropcolumn/${currentSelection.tableName}/${columnName}`;
export const dropCol = (tableName: string, columnName: string) => {
  return new Promise(function (resolve, reject) {
    axios
      .delete(
        `${CONFIG.baseDbURL}/dbutils/dropcolumn/${tableName}/${columnName}`, { withCredentials: true })
      .then((response) => {
        if (response.data.error) {
          reject(response.data.error);
        } else {
          resolve("");
        }
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
};

export const exportDB = () => {
  return new Promise(function (resolve, reject) {
    axios
      .get(
        `${CONFIG.baseDbURL}/dbutils/export`, { withCredentials: true })
      .then((response) => {
        if (response.data.error) {
          reject(response.data.error);
        } else {
          // TODO: Do we want this?
          console.log(response.data.toString());
          resolve("");
        }
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
};
