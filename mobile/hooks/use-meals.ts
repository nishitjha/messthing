import { useEffect, useState } from "react";
import axios from "@/utils/axios";
import { useAuth } from "./use-auth";

type Menu = {
  day: string;
  date: string;
  breakfast: string[];
  lunch: string[];
  dinner: string[];
  status:string[];
  eaten: boolean[];
  id: number[];
};

export function useMeals() {
  const [meals, setMeals] = useState<Menu | null>(null);
  const { user } = useAuth();
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const today = days[new Date().getDay()];

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get("/api/menu");

        response.data.menu.forEach((item: Menu) => {
          if (item.day === today) {
            return user?.id ? updateStatus(item) : null;
          }
        });
      } catch (error) {
        console.error("Error fetching za menu:", error);
      }
    };

    fetchMenu();
  }, []);

  async function updateStatus(menu: Menu){const now = new Date();
const timeNum = now.getHours() + now.getMinutes() / 60;
const isSunday = today === "Sunday";

const meals = [
  { name: 'breakfast', range: isSunday ? [8, 10] : [7.5, 9.5] },
  { name: 'lunch', range: isSunday ? [12, 14] : [11.5, 13.5] },
  { name: 'dinner', range: [19.15, 20.30] }
];

const status = meals.map(meal => {
  if (timeNum >= meal.range[0] && timeNum < meal.range[1]) return "present";
  if (timeNum >= meal.range[1]) return "past";
  return "future";
});

if (menu) {
  menu.status = status;
}

    const token = await window?.Clerk?.session?.getToken();

    const response = await axios.get(`/users/${user?.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    
    menu.id.forEach((id, index) => {
        if (response.data.user.eaten === null) {
            menu.eaten = [false, false, false];
        } 
        else if (response.data.user.eaten[id]) {
            menu.eaten[id] = true;
        } else {
            menu.eaten[id] = false;
        }
    }
    );

    setMeals(menu);
  }

  const refreshMeals = () => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get("/api/menu");

        response.data.menu.forEach((item: Menu) => {
          if (item.day === today) {
            updateStatus(item);
          }
        });
      } catch (error) {
        console.error("Error fetching za menu:", error);
      }
    };

    fetchMenu();
  };

  return {meals, refreshMeals};
}
