"use client";

import { eventSpots } from "@/data/spots";
import { useEngagement } from "./engagement-provider";
import { useOperations } from "./operations-provider";
import shell from "@/app/app-shell.module.css";

const availabilityLabels = {
  open: "営業中",
  paused: "一時休止",
  sold_out: "売切れ",
} as const;

const congestionLabels = {
  low: "空いています",
  medium: "やや混雑",
  high: "混雑",
} as const;

export function LiveSpots() {
  const { state } = useOperations();
  const { state: engagement, dispatch } = useEngagement();

  return (
    <div className={shell.spotGrid}>
      {eventSpots.map((spot) => {
        const operation = state.spots[spot.id];

        return (
          <article className={shell.spotCard} key={spot.id}>
            <span className={shell.status}>
              {spot.categoryLabel}・
              {operation
                ? availabilityLabels[operation.availability]
                : spot.statusLabel}
            </span>
            <h2>{spot.name}</h2>
            <p>{spot.description}</p>
            {operation && (
              <strong className={shell.congestion}>
                混雑度：{congestionLabels[operation.congestion]}
              </strong>
            )}
            <small>
              {spot.coordinateStatus === "verified"
                ? "起終点を確認済み"
                : "中間配置はプレゼン用の仮データです"}
            </small>
            <button
              className={shell.favorite}
              type="button"
              aria-pressed={engagement.favoriteSpotIds.includes(spot.id)}
              onClick={() =>
                dispatch({ type: "toggle_spot_favorite", id: spot.id })
              }
            >
              {engagement.favoriteSpotIds.includes(spot.id) ? "★" : "☆"}
              <span>お気に入り</span>
            </button>
          </article>
        );
      })}
    </div>
  );
}
