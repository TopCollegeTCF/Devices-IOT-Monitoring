/**
 * Общие типы данных, используемые на клиенте и сервере
 */

/** Географическая координата */
export interface GeoCoordinate {
    lat: number; // Широта (-90 до 90)
    lon: number; // Долгота (-180 до 180)
    altitude?: number; // Высота над уровнем моря
}

/** Географическая позиция с временной меткой */
export interface GeoPosition extends GeoCoordinate {
    timestamp: Date;
}

/** Точка с географическими координатами */
export interface GeoPoint {
    type: 'Point';
    coordinates: [number, number, number?]; // [lon, lat, alt]
}

/** Линия с географическими координатами */
export interface GeoLine {
    type: 'LineString';
    coordinates: [number, number, number?][];
}

/** Полигон с географическими координатами */
export interface GeoPolygon {
    type: 'Polygon';
    coordinates: [number, number, number?][][];
}

/** Геометрический объект GeoJSON */
export type GeoGeometry = GeoPoint | GeoLine | GeoPolygon;

/** Географический объект с свойствами */
export interface GeoFeature<T = any> {
    type: 'Feature';
    geometry: GeoGeometry;
    properties: T;
    id?: string;
}

/** Коллекция географических объектов */
export interface GeoFeatureCollection<T = any> {
    type: 'FeatureCollection';
    features: GeoFeature<T>[];
}

/** Базовый маркер на глобусе */
export interface Marker<T = any> {
    id: string;
    position: GeoCoordinate;
    title: string;
    description: string;
    category: string;
    data: T;
    icon?: string;
    color?: string;
    size?: number;
}

/** Граница территории */
export interface Territory {
    id: string;
    name: string;
    type: 'country' | 'region' | 'city' | 'historical' | 'natural';
    boundaries: GeoFeature;
    center: GeoCoordinate;
    area: number;
    population?: number;
    established?: Date;
    dissolved?: Date;
    metadata: Record<string, any>;
}

/** Событие (историческое, природное, техническое) */
export interface Event {
    id: string;
    title: string;
    description: string;
    type: 'historical' | 'natural' | 'technical' | 'cultural';
    date: Date;
    endDate?: Date;
    location: GeoCoordinate;
    territories?: string[];
    sources: string[];
    importance: 1 | 2 | 3 | 4 | 5;
    media: string[];
}

/** Биологический вид */
export interface Species {
    id: string;
    name: string;
    scientificName: string;
    kingdom: string;
    phylum: string;
    class: string;
    order: string;
    family: string;
    genus: string;
    distribution: GeoFeature[];
    population?: number;
    status: 'common' | 'rare' | 'endangered' | 'extinct' | 'invasive';
    habitat: string[];
    discoveries: Event[];
}

/** Технический объект */
export interface TechnicalObject {
    id: string;
    name: string;
    type: 'building' | 'infrastructure' | 'machine' | 'vehicle' | 'facility';
    location: GeoCoordinate;
    constructionDate?: Date;
    decommissionDate?: Date;
    status: 'active' | 'inactive' | 'historical';
    specifications: Record<string, any>;
    significance: string;
}