import {
  getAllUsers as getAllUsersModel,
  findUserById,
} from "../models/user.model.js";

export async function getAllUsers() {
  return getAllUsersModel();
}

export async function getUserById(id) {
  return findUserById(id);
}
