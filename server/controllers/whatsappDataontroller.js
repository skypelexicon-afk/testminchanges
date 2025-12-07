import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { users } from "../schema/schema.js";

// 1️⃣ Check if name & phone exist
export const checkWhatsAppData = async (req, res) => {
    try {
        const user = req.user;
        const [userData] = await db
            .select({
                name: users.name,
                phone: users.phone,
            })
            .from(users)
            .where(eq(users.id, user.id));

        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!userData.name || !userData.phone) {
      return res.status(200).json({ success: false, message: "Phone or name missing" });
    }

        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 2️⃣ Update / Save name & phone 
export const updateWhatsAppData = async (req, res) => {
    const user = req.user;
    const { name, phone } = req.body;

    if (!name || !phone) {
        return res.status(400).json({ success: false, message: "Name and phone required" });
    }

    try {
        await db
            .update(users)
            .set({ name, phone })
            .where(eq(users.id, user.id));

        return res.status(200).json({ success: true, message: "WhatsApp data updated successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 3️⃣ Display stored name & phone
export const adminGetWhatsAppData = async (req, res) => {
    try {
        const allUsers = await db
            .select({
                id: users.id,
                name: users.name,
                phone: users.phone,
            })
            .from(users);

        return res.status(200).json({
            success: true,
            total: allUsers.length,
            data: allUsers,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
