"use client";

import { scheduleItems } from "@/data/schedule";
import { useEngagement } from "./engagement-provider";
import { useOperations } from "./operations-provider";
import shell from "@/app/app-shell.module.css";

const statusLabels = {
  on_time: "予定どおり",
  delayed: "遅延",
  cancelled: "中止",
} as const;

export function LiveSchedule() {
  const { state } = useOperations();
  const { state: engagement, dispatch } = useEngagement();

  return (
    <div className={shell.scheduleList}>
      {scheduleItems.map((item) => {
        const operation = state.schedule[item.id];

        return (
          <article className={shell.scheduleItem} key={item.id}>
            <div className={shell.time}>
              {item.time}
              <small>〜 {item.endTime}</small>
            </div>
            <div>
              <h2>{item.title}</h2>
              <p>
                {item.area}／{item.participants}
              </p>
              {operation?.status !== "on_time" && (
                <p className={shell.liveStatus}>
                  {statusLabels[operation.status]}
                  {operation.status === "delayed"
                    ? `・約${operation.delayMinutes}分遅れ`
                    : ""}
                </p>
              )}
            </div>
            <span className={shell.kind}>
              {operation ? statusLabels[operation.status] : item.kind}
            </span>
            <button
              className={shell.favorite}
              type="button"
              aria-pressed={engagement.favoriteProgramIds.includes(item.id)}
              onClick={() =>
                dispatch({ type: "toggle_program_favorite", id: item.id })
              }
            >
              {engagement.favoriteProgramIds.includes(item.id) ? "★" : "☆"}
              <span>お気に入り</span>
            </button>
          </article>
        );
      })}
    </div>
  );
}
