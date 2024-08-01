import Notification from "../../models/notification.js";
import mongoose from "mongoose";

export const getNotifications = {
  do: async (req, res) => {
    const { page = 0, pageSize = 10 } = req.query;
    const { uid } = req;
    const notifications = await Notification.aggregate([
      {
        $match: {
          notifedUser: new mongoose.Types.ObjectId(uid),
        },
      },
      {
        $group: {
          _id: "$_id",
          count: { $sum: 1 },
          notifedUser: { $first: "$notifedUser" },
          notifierUser: { $first: "$notifierUser" },
          type: { $first: "$type" },
          targetUser: { $first: "$user" },
          redirectSlug: { $first: "$redirectSlug" },
          title: { $first: "$title" },
          body: { $first: "$body" },
        },
      },
      {
        $facet: {
          metadata: [{ $count: "count" }],
          data: [
            { $skip: page * pageSize },
            { $limit: parseInt(pageSize) },
          ],
        },
      },
    ]);

    console.log("user notifications", notifications);
    res.json({
      ok: true,
      notifications,
    });
  },
};
