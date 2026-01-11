'use client';

import { useEffect, useState, useRef } from 'react';
import { getCityCoordinates } from '@/utils/coordinates';
import type { Park, Shelter } from '@/lib/ggClimate';

interface ClimateMapProps {
  location: string;
  height?: string;
  parks?: Park[];
  shelters?: Shelter[];
}

export default function ClimateMap({ location, height = '350px', parks = [], shelters = [] }: ClimateMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    let map: any = null;

    // Leaflet 동적 로드
    import('leaflet').then((L) => {
      // 아이콘 설정
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // 기존 맵 제거
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      // 컨테이너 초기화
      const mapContainer = containerRef.current;
      if (!mapContainer) return;

      // 컨테이너 내부 완전 비우기
      mapContainer.innerHTML = '';
      mapContainer.id = `climate-map-${Date.now()}`;

      // 지도 생성
      const cityCoords = getCityCoordinates(location.split(' ')[0]);
      map = L.map(mapContainer).setView([cityCoords[1], cityCoords[0]], 12);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // 중심 마커 추가 (도시 중심)
      L.marker([cityCoords[1], cityCoords[0]], {
        icon: L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          shadowSize: [41, 41],
        }),
      })
        .addTo(map)
        .bindPopup(`<b>${location.split(' ')[0]}</b><br/>도시 중심`)
        .openPopup();

      // 공원 마커 추가
      parks.forEach((park) => {
        const [lng, lat] = park.coordinates;

        // 공원 마커 (초록색 원으로 표시)
        L.circleMarker([lat, lng], {
          radius: 6,
          fillColor: '#4CAF50',
          color: '#2E7D32',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.7,
        })
          .addTo(map)
          .bindPopup(
            `<div style="min-width: 150px;">
              <b>🌳 ${park.name}</b><br/>
              <small>분류: ${park.category}</small><br/>
              <small>면적: ${park.area.toFixed(2)}㎡</small>
            </div>`
          );
      });

      // 대피소 마커 추가
      shelters.forEach((shelter) => {
        const [lng, lat] = shelter.coordinates;

        // 대피소 마커 (빨간색 원으로 표시)
        L.circleMarker([lat, lng], {
          radius: 8,
          fillColor: '#EF4444',
          color: '#B91C1C',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8,
        })
          .addTo(map)
          .bindPopup(
            `<div style="min-width: 150px;">
              <b>🏠 ${shelter.name}</b><br/>
              <small>유형: ${shelter.type}</small><br/>
              <small>${shelter.address}</small>
            </div>`
          );
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isMounted, location, parks, shelters]);

  if (!isMounted) {
    return (
      <div
        className="bg-gray-100 rounded-[20px] flex items-center justify-center"
        style={{ height }}
      >
        <p className="text-gray-500">지도 준비 중...</p>
      </div>
    );
  }

  return (
    <div className="relative" style={{ height }}>
      <div
        ref={containerRef}
        className="rounded-[20px] overflow-hidden shadow-md"
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
}
