import { Todolist } from './Todolist/Todolist';
import { todolistsAPI, TodolistType } from "../../api/todolists-api";
import { Dispatch } from "redux";
import {
  appActions,
  RequestStatusType
} from "../../app/app-reducer";
import { handleServerNetworkError } from "../../utils/error-utils";
import { AppThunk } from "../../app/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";


const slice = createSlice({
  name: 'todolists',
  initialState: [] as TodolistDomainType[],
  reducers: {
    removeTodolist: (state, action: PayloadAction<{id: string}>) => {
      const index = state.findIndex((todo) => todo.id === action.payload.id)
      if(index !== -1) state.splice(index, 1)

      // return state.filter(todo => todo.id !== action.payload.id)  
    },
    addTodolist: (state, action: PayloadAction<{todolist: TodolistType}>) => {

      const newTodolist = {...action.payload.todolist, filter: 'all', entityStatus: "idle"} as TodolistDomainType
      state.unshift(newTodolist)
    },
    changeTodolistTitle : (state, action: PayloadAction<{id: string, title: string}>) => {
      const index = state.findIndex(todo => todo.id === action.payload.id)
      if(index !== -1) state[index].title = action.payload.title
    },
    changeTodolistFilter: (state, action: PayloadAction<{id: string, filter: FilterValuesType}>) => {
      const index = state.findIndex(todo => todo.id === action.payload.id)
      if(index !== -1) state[index].filter = action.payload.filter
    },
    changeTodolistEntity: (state, action: PayloadAction<{id: string, status: RequestStatusType}>) => {
      const index = state.findIndex(todo => todo.id === action.payload.id)
      if(index !== -1) state[index].entityStatus = action.payload.status
    },
    setTodolists: (state, action: PayloadAction<{todolists: TodolistType[]}>) => {
      return action.payload.todolists.map(todo => ({...todo, filter: 'all', entityStatus: 'idle' }))
    }
  }
})

export const todolistsReducer = slice.reducer
export const todolistsActions = slice.actions

// const initialState: Array<TodolistDomainType> = [];

// export const todolistsReducer = (
//   state: Array<TodolistDomainType> = initialState,
//   action: ActionsType
// ): Array<TodolistDomainType> => {
//   switch (action.type) {
    // case "REMOVE-TODOLIST":
    //   return state.filter((tl) => tl.id != action.id);
    // case "ADD-TODOLIST":
      // return [{ ...action.todolist, filter: "all", entityStatus: "idle" }, ...state];

    // case "CHANGE-TODOLIST-TITLE":
    //   return state.map((tl) => (tl.id === action.id ? { ...tl, title: action.title } : tl));
    // case "CHANGE-TODOLIST-FILTER":
    //   return state.map((tl) => (tl.id === action.id ? { ...tl, filter: action.filter } : tl));
    // case "CHANGE-TODOLIST-ENTITY-STATUS":
    //   return state.map((tl) => (tl.id === action.id ? { ...tl, entityStatus: action.status } : tl));
//     case "SET-TODOLISTS":
//       return action.todolists.map((tl) => ({ ...tl, filter: "all", entityStatus: "idle" }));
//     default:
//       return state;
//   }
// };

// actions
// export const removeTodolistAC = (id: string) => ({ type: "REMOVE-TODOLIST", id } as const);
// export const addTodolistAC = (todolist: TodolistType) => ({ type: "ADD-TODOLIST", todolist } as const);
// export const changeTodolistTitleAC = (id: string, title: string) =>
  // ({
  //   type: "CHANGE-TODOLIST-TITLE",
  //   id,
  //   title,
  // } as const);
// export const changeTodolistFilterAC = (id: string, filter: FilterValuesType) =>
//   ({
//     type: "CHANGE-TODOLIST-FILTER",
//     id,
//     filter,
//   } as const);
// export const changeTodolistEntityStatusAC = (id: string, status: RequestStatusType) =>
//   ({
//     type: "CHANGE-TODOLIST-ENTITY-STATUS",
//     id,
//     status,
//   } as const);
// export const setTodolistsAC = (todolists: Array<TodolistType>) => ({ type: "SET-TODOLISTS", todolists } as const);

// thunks
export const fetchTodolistsTC = (): AppThunk => {
  return (dispatch) => {
    dispatch(appActions.setAppStatus({status:"loading"}));
    todolistsAPI
      .getTodolists()
      .then((res) => {
        dispatch(todolistsActions.setTodolists({todolists:res.data}));
        dispatch(appActions.setAppStatus({status:"succeeded"}));
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch);
      });
  };
};
export const removeTodolistTC = (todolistId: string): AppThunk => {
  return (dispatch) => {
    //изменим глобальный статус приложения, чтобы вверху полоса побежала
    dispatch(appActions.setAppStatus({status:"loading"}));
    //изменим статус конкретного тудулиста, чтобы он мог задизеблить что надо
    dispatch(todolistsActions.changeTodolistEntity({id: todolistId, status:"loading"}));
    todolistsAPI.deleteTodolist(todolistId).then(() => {
      dispatch(todolistsActions.removeTodolist({id: todolistId}));
      //скажем глобально приложению, что асинхронная операция завершена
      dispatch(appActions.setAppStatus({status:"succeeded"}));
    });
  };
};
export const addTodolistTC = (title: string): AppThunk => {
  return (dispatch) => {
    dispatch(appActions.setAppStatus({status:"loading"}));
    todolistsAPI.createTodolist(title).then((res) => {
      dispatch(todolistsActions.addTodolist({todolist: res.data.data.item}));
      dispatch(appActions.setAppStatus({status:"succeeded"}));
    });
  };
};
export const changeTodolistTitleTC = (id: string, title: string): AppThunk => {
  return (dispatch) => {
    todolistsAPI.updateTodolist(id, title).then((res) => {
      dispatch(todolistsActions.changeTodolistTitle({id:id, title:title}));
    });
  };
};

// types
// export type AddTodolistActionType = ReturnType<typeof addTodolistAC>;
// export type RemoveTodolistActionType = ReturnType<typeof removeTodolistAC>;
// export type SetTodolistsActionType = ReturnType<typeof setTodolistsAC>;
// type ActionsType =
//   | RemoveTodolistActionType
//   | AddTodolistActionType
//   | ReturnType<typeof changeTodolistTitleAC>
//   | ReturnType<typeof changeTodolistFilterAC>
//   | SetTodolistsActionType
//   | ReturnType<typeof changeTodolistEntityStatusAC>;
export type FilterValuesType = "all" | "active" | "completed";
export type TodolistDomainType = TodolistType & {
  filter: FilterValuesType;
  entityStatus: RequestStatusType;
};
