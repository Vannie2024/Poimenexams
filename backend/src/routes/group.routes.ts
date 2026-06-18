import { Router } from "express";

import {
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupById,
  addMemberToGroup,
  removeMemberFromGroup
} from "../controllers/group.controller";

const router = Router();

router.get("/", getGroups);

router.post("/", createGroup);

router.put("/:id", updateGroup);

router.delete("/:id", deleteGroup);

router.get("/:id", getGroupById);

router.post("/:id/members", addMemberToGroup);

router.delete("/:id/members/:userId", removeMemberFromGroup);

export default router;