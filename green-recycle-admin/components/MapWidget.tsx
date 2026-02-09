import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Truck, Loader2, Navigation } from 'lucide-react';
import type { Order, Collector } from '../types';
import { API_BASE } from '../constants';

// Fix Leaflet icon issue
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Icons
const createCustomIcon = (color: string) => {
  return L.divIcon({
    html: `<div style="background-color: white; padding: 4px; border-radius: 50%; border: 2px solid ${color}; box-shadow: 0 2px 4px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; color: ${color}; width: 32px; height: 32px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>`,
    className: 'custom-map-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

const createTruckIcon = () => {
  return L.divIcon({
    html: `<div style="background-color: #4f46e5; padding: 6px; border-radius: 8px; box-shadow: 0 2px 10px rgba(79, 70, 229, 0.3); color: white; display: flex; align-items: center; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3m15 0h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1m-9 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0m10 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0"/></svg>
          </div>`,
    className: 'custom-truck-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

// Component to auto-center map when coordinates change
const ChangeView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

interface MapWidgetProps {
  order: Order;
  collector?: Collector;
}

const MapWidget: React.FC<MapWidgetProps> = ({ order, collector }) => {
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [collectorCoords, setCollectorCoords] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default to Shenzhen coordinates if loading fails
  const DEFAULT_CENTER: [number, number] = [22.5431, 114.0579];

  useEffect(() => {
    const fetchCoords = async () => {
      setLoading(true);
      try {
        // 1. 地理编码订单地址
        let userPos: [number, number] | null = null;
        const resp = await fetch(`${API_BASE}/api/v1/geo/geocode?address=${encodeURIComponent(order.address)}`);
        if (resp.ok) {
          const data = await resp.json();
          userPos = [data.lat, data.lon];
        } else {
          // 降级方案：演示用随机坐标
          userPos = [22.5431 + (Math.random() - 0.5) * 0.05, 114.0579 + (Math.random() - 0.5) * 0.05];
        }
        setUserCoords(userPos);

        // P2修复: 使用本次获取的 userPos 而非异步 state，避免竞态条件
        if (collector && userPos) {
          setCollectorCoords([
            userPos[0] + 0.01,
            userPos[1] - 0.01
          ]);
        }
      } catch (err) {
        console.error('Map geocoding failed:', err);
        setError('无法加载地图位置信息');
      } finally {
        setLoading(false);
      }
    };

    fetchCoords();
  }, [order.address, collector]);

  if (loading) {
    return (
      <div className="w-full h-[320px] bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
        <p className="text-slate-500 text-sm font-medium">正在解析地理位置...</p>
      </div>
    );
  }

  const center: [number, number] = userCoords || DEFAULT_CENTER;

  return (
    <div className="w-full bg-slate-50 rounded-xl border border-slate-200 shadow-sm overflow-hidden relative h-[320px] group">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={center} zoom={13} />
        
        {userCoords && (
          <Marker position={userCoords} icon={createCustomIcon('#ef4444')}>
            <Popup>
              <div className="p-1">
                <p className="font-bold text-slate-900">{order.user_name}</p>
                <p className="text-xs text-slate-500">{order.address}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {collectorCoords && (
          <Marker position={collectorCoords} icon={createTruckIcon()}>
            <Popup>
              <div className="p-1">
                <p className="font-bold text-indigo-600">{collector?.name}</p>
                <p className="text-xs text-slate-500">正在前往取货点...</p>
              </div>
            </Popup>
          </Marker>
        )}

        {userCoords && collectorCoords && (
          <Polyline 
            positions={[collectorCoords, userCoords]} 
            pathOptions={{ color: '#4f46e5', weight: 3, dashArray: '10, 10', opacity: 0.6 }} 
          />
        )}
      </MapContainer>

      {/* Floating Info Overlay */}
      <div className="absolute top-4 left-4 z-[400] pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-200/50 flex flex-col gap-2 max-w-[200px]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">实时配送监控</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-start gap-2">
              <MapPin size={14} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs font-bold text-slate-800 line-clamp-2">{order.address}</p>
            </div>
            {collector && (
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                <Truck size={14} className="text-indigo-500 shrink-0" />
                <p className="text-xs font-medium text-slate-600">回收员: {collector.name}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-4 right-4 z-[400] flex flex-col gap-2">
        <button 
          className="bg-white p-2.5 rounded-xl shadow-lg border border-slate-200 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all pointer-events-auto active:scale-95"
          title="重新定位"
          onClick={() => {
            // Internal Leaflet trigger would go here
          }}
        >
          <Navigation size={20} />
        </button>
      </div>

      {error && (
        <div className="absolute inset-0 z-[500] bg-slate-900/10 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white p-4 rounded-xl shadow-xl border border-red-100 flex items-center gap-3">
            <div className="bg-red-50 p-2 rounded-lg text-red-500">
              <MapPin size={20} />
            </div>
            <p className="text-sm font-bold text-slate-800">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapWidget;
