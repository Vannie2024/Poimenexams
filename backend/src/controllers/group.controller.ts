import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { error } from "console";


export const getGroups = async (
  req: Request,
  res: Response
) => {
  try {
    const groups =
      await prisma.group.findMany({
        include: {
          members: true,
        },
      });

    return res.json(groups);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export const createGroup = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, description } =
      req.body;

    const group =
      await prisma.group.create({
        data: {
          name,
          description,
        },
      });

    return res.status(201).json(group);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export const updateGroup = async (
  req: Request,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    const {
      name,
      description,
    } = req.body;

    const group =
      await prisma.group.update({
        where: {
          id,
        },
        data: {
          name,
          description,
        },
      });

    return res.json(group);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export const deleteGroup = async (
  req: Request,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    await prisma.groupMember.deleteMany({
      where: {
        groupId: id,
      },
    });

    await prisma.group.delete({
      where: {
        id,
      },
    });

    return res.json({
      message: "Deleted",
    });
  } catch (error){
    console.error(error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export const getGroupById = async (
  req: Request,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    const group =
      await prisma.group.findUnique({
        where: {
          id,
        },
        include: {
          members: {
            include: {
              user: true,
            },
          },
        },
      });

    return res.json(group);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export const addMemberToGroup = async (
  req: Request,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    const { userId } = req.body;

    const existing = 
    await prisma.groupMember.findFirst({
        where: {
            groupId: id,
            userId: userId,
        },
    });

    if (existing) {
        return res.status(400).json({
            message: "User is already a member of this group",
        });
    }

    const member =
      await prisma.groupMember.create({
        data: {
          groupId: id,
          userId: userId,
        },
      });
    
    return res.status(201).json(member);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export const removeMemberFromGroup =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const id = String(req.params.id);

      const userId =
        String(req.params.userId);

        console.log("GROUP:", id);
        console.log("USER:", userId);

      await prisma.groupMember.delete({
        where: {
          userId_groupId: {
            userId,
            groupId: id,
          },
        },
      });

      return res.json({
        message: "Removed",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Server Error",
      });
    }
  };