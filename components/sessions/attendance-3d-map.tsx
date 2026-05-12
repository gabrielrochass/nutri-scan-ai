"use client";

import { useEffect, useMemo, useState } from "react";
import DeckGL from "@deck.gl/react";
import { MapView, type MapViewState } from "@deck.gl/core";
import { ScatterplotLayer } from "@deck.gl/layers";
import { HexagonLayer } from "@deck.gl/aggregation-layers";
import { Layers, Maximize2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AttendanceDTO } from "@/lib/dto";

type Point = {
  position: [number, number];
  weight: number;
  name: string;
  matricula: string;
  distanceM: number;
  createdAt: string;
};

type Props = {
  sessionId: string;
  centerLat: number;
  centerLon: number;
  radiusM: number;
  attendancesWithCoords: Array<
    AttendanceDTO & { lat: number; lon: number }
  >;
};

const CIN_RED_RGB: [number, number, number] = [125, 51, 51];
const CIN_RED_LIGHT_RGB: [number, number, number] = [200, 120, 120];

const HEX_COLOR_RANGE: [number, number, number][] = [
  [241, 230, 230],
  [228, 192, 192],
  [212, 144, 144],
  [185, 100, 100],
  [148, 65, 65],
  [110, 35, 35],
];

const INITIAL_PITCH = 50;
const INITIAL_BEARING = -15;

function computeZoomForRadius(radiusM: number): number {
  if (radiusM <= 25) return 19;
  if (radiusM <= 50) return 18.5;
  if (radiusM <= 100) return 17.5;
  if (radiusM <= 250) return 16.5;
  if (radiusM <= 500) return 15.5;
  return 14;
}

function ringPolygon(
  centerLon: number,
  centerLat: number,
  radiusM: number,
  segments = 64,
): [number, number][] {
  const lat = (centerLat * Math.PI) / 180;
  const dLat = radiusM / 111_320;
  const dLon = radiusM / (111_320 * Math.cos(lat));
  const points: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * 2 * Math.PI;
    points.push([
      centerLon + dLon * Math.cos(theta),
      centerLat + dLat * Math.sin(theta),
    ]);
  }
  return points;
}

export function Attendance3DMap({
  sessionId,
  centerLat,
  centerLon,
  radiusM,
  attendancesWithCoords,
}: Props) {
  const [points, setPoints] = useState<Point[]>(() =>
    attendancesWithCoords.map((a) => ({
      position: [a.lon, a.lat],
      weight: 1,
      name: a.name,
      matricula: a.matricula,
      distanceM: a.distanceM,
      createdAt: a.createdAt,
    })),
  );
  useEffect(() => {
    const es = new EventSource(`/api/sessions/${sessionId}/stream`);
    es.addEventListener("attendance", (ev) => {
      const payload = JSON.parse((ev as MessageEvent).data) as AttendanceDTO & {
        lat?: number;
        lon?: number;
      };
      if (typeof payload.lat !== "number" || typeof payload.lon !== "number") {
        return;
      }
      setPoints((prev) =>
        prev.some((p) => p.matricula === payload.matricula)
          ? prev
          : [
              ...prev,
              {
                position: [payload.lon, payload.lat],
                weight: 1,
                name: payload.name,
                matricula: payload.matricula,
                distanceM: payload.distanceM,
                createdAt: payload.createdAt,
              },
            ],
      );
    });
    return () => es.close();
  }, [sessionId]);

  const initialViewState = useMemo<MapViewState>(
    () => ({
      longitude: centerLon,
      latitude: centerLat,
      zoom: computeZoomForRadius(radiusM),
      pitch: INITIAL_PITCH,
      bearing: INITIAL_BEARING,
    }),
    [centerLat, centerLon, radiusM],
  );

  const layers = useMemo(() => {
    const ring = ringPolygon(centerLon, centerLat, radiusM);
    return [
      new ScatterplotLayer<{ path: [number, number][] }>({
        id: "geofence-ring",
        data: ring.map((p) => ({ path: [p] })),
        getPosition: (d) => d.path[0],
        getRadius: 0.6,
        radiusUnits: "meters",
        getFillColor: [125, 51, 51, 180],
        pickable: false,
      }),
      new ScatterplotLayer<Point>({
        id: "attendance-points",
        data: points,
        getPosition: (d) => d.position,
        getRadius: 2.4,
        radiusUnits: "meters",
        getFillColor: [...CIN_RED_LIGHT_RGB, 200],
        getLineColor: [...CIN_RED_RGB, 255],
        lineWidthUnits: "meters",
        getLineWidth: 0.4,
        stroked: true,
        pickable: true,
      }),
      new HexagonLayer<Point>({
        id: "density-hex",
        data: points,
        getPosition: (d) => d.position,
        getElevationWeight: (d) => d.weight,
        radius: Math.max(3, Math.min(radiusM / 6, 10)),
        elevationScale: 4,
        elevationRange: [0, 60],
        extruded: true,
        opacity: 0.65,
        coverage: 0.9,
        colorRange: HEX_COLOR_RANGE,
        pickable: false,
        material: {
          ambient: 0.6,
          diffuse: 0.6,
          shininess: 32,
          specularColor: [60, 60, 60],
        },
      }),
    ];
  }, [points, centerLat, centerLon, radiusM]);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="grid gap-1">
            <CardTitle className="flex items-center gap-2">
              <Layers className="size-4 text-primary" />
              Mapa de densidade · 3D
            </CardTitle>
            <CardDescription>
              Cada hexágono representa um agrupamento de presenças validadas
              dentro do raio do geofence.
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-[10px]">
            {points.length} pts
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div
          className="relative h-90 w-full bg-foreground/95"
          style={{ touchAction: "none" }}
        >
          <DeckGL
            views={new MapView({ repeat: false })}
            initialViewState={initialViewState}
            controller
            layers={layers}
            getTooltip={({ object }) => {
              if (!object) return null;
              const p = object as Point;
              return {
                html: `<div style="font-family:var(--font-sans,system-ui);font-size:11px;line-height:1.4">
                  <strong>${escapeHtml(p.name)}</strong><br/>
                  ${escapeHtml(p.matricula)} · ${p.distanceM.toFixed(1)} m
                </div>`,
                style: {
                  backgroundColor: "rgba(20,12,12,0.92)",
                  color: "#fef2f2",
                  borderRadius: "6px",
                  padding: "6px 8px",
                  border: "1px solid rgba(125,51,51,0.6)",
                },
              };
            }}
          />
          <div className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-background/85 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground backdrop-blur">
            <Maximize2 className="size-3" />
            Arraste · Pinça · Rotacione
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
