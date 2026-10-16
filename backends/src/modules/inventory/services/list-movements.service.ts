import { listMovements } from "../repositories/list-movements.repository";

export async function listMovementsService() {
  return listMovements();
}
