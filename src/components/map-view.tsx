"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { demoMapCenter, eventSpots, greenwayRoute } from "@/data/spots";
import { useEngagement } from "./engagement-provider";
import { useOperations } from "./operations-provider";
import styles from "./map-view.module.css";

const markerColors = {
  start: "#173d2d",
  music: "#7255a5",
  food: "#d36f32",
  experience: "#2b7c71",
  turnaround: "#315f9c",
  goal: "#b54832",
} as const;

export function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { state: operationsState } = useOperations();
  const { state: engagementState } = useEngagement();

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    maplibregl.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

    const map = new maplibregl.Map({
      container: containerRef.current,
      center: [demoMapCenter.longitude, demoMapCenter.latitude],
      zoom: 13.5,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution:
              '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          },
          greenway: {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: greenwayRoute,
              },
            },
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
          },
          {
            id: "greenway-outline",
            type: "line",
            source: "greenway",
            paint: {
              "line-color": "#ffffff",
              "line-width": 9,
              "line-opacity": 0.9,
            },
          },
          {
            id: "greenway-outbound",
            type: "line",
            source: "greenway",
            paint: {
              "line-color": "#2d7b4f",
              "line-width": 4,
              "line-offset": -3,
              "line-dasharray": [1.5, 1],
            },
          },
          {
            id: "greenway-return",
            type: "line",
            source: "greenway",
            paint: {
              "line-color": "#d36f32",
              "line-width": 4,
              "line-offset": 3,
              "line-dasharray": [1.5, 1],
            },
          },
        ],
      },
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.fitBounds(
      [
        [139.36303, 36.04607],
        [139.37569, 36.06814],
      ],
      { padding: 48, duration: 0 },
    );

    eventSpots.forEach((spot) => {
      const marker = document.createElement("button");
      marker.type = "button";
      marker.className = styles.marker;
      marker.style.setProperty("--marker-color", markerColors[spot.category]);
      marker.setAttribute("aria-label", `${spot.name}、${spot.statusLabel}`);
      marker.textContent =
        spot.category === "start"
          ? "S"
          : spot.category === "turnaround"
            ? "T"
          : spot.category === "goal"
            ? "G"
            : spot.category === "music"
              ? "♪"
              : "●";

      new maplibregl.Marker({
        element: marker,
        offset:
          spot.category === "start"
            ? [-18, 0]
            : spot.category === "goal"
              ? [18, 0]
              : [0, 0],
      })
        .setLngLat([spot.longitude, spot.latitude])
        .setPopup(
          new maplibregl.Popup({ offset: 20, closeButton: false }).setHTML(
            `<strong>${spot.name}</strong><p>${spot.description}</p><p>${
              operationsState.spots[spot.id]?.availability === "sold_out"
                ? "売切れ"
                : operationsState.spots[spot.id]?.availability === "paused"
                  ? "一時休止"
                  : "営業中"
            }／混雑度：${
              operationsState.spots[spot.id]?.congestion === "high"
                ? "混雑"
                : operationsState.spots[spot.id]?.congestion === "medium"
                  ? "やや混雑"
                  : "空いています"
            }</p><small>${
              spot.coordinateStatus === "verified"
                ? "起終点を確認済み"
                : "中間配置はプレゼン用の仮位置"
            }</small>`,
          ),
        )
        .addTo(map);
    });

    return () => map.remove();
  }, [operationsState.spots]);

  return (
    <>
      {engagementState.participantId && (
        <section className={styles.participationStatus} aria-label="参加状況">
          <div>
            <span>参加受付済み</span>
            <strong>{engagementState.participantId}</strong>
          </div>
          <p>
            STARTスタンプ取得済み。緑道を進み、次は「GREENWAY CAFÉ」を目指してください。
          </p>
        </section>
      )}
      <div className={styles.map} ref={containerRef} aria-label="会場マップ" />
    </>
  );
}
