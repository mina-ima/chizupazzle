
import * as d3 from 'd3-geo';
import * as topojson from 'topojson-client';
import { Prefecture } from '../types';
import { PREFECTURES } from '../constants';

// 複数のソースを用意して信頼性を向上
const DATA_SOURCES = [
  'https://raw.githubusercontent.com/dataofjapan/land/master/japan.topojson',
  'https://unpkg.com/japan-topojson/japan.topojson'
];

export const fetchAndProcessMapData = async (): Promise<Prefecture[]> => {
  let topology: any = null;
  
  // 順番にソースを試す
  for (const url of DATA_SOURCES) {
    try {
      console.log(`Trying to fetch map data from: ${url}`);
      const response = await fetch(url);
      if (response.ok) {
        topology = await response.json();
        break; // 成功したらループを抜ける
      }
    } catch (e) {
      console.warn(`Failed to fetch from ${url}`, e);
    }
  }

  if (!topology) {
    console.error("All map data sources failed.");
    return PREFECTURES; // フォールバック（パスなし）
  }

  try {
    // ジオメトリオブジェクトを探す
    let objectKey = 'japan';
    if (!topology.objects[objectKey]) {
        objectKey = 'prefectures';
    }
    if (!topology.objects[objectKey]) {
        // キーが見つからない場合は最初のキーを使用
        objectKey = Object.keys(topology.objects)[0];
    }

    if (!objectKey || !topology.objects[objectKey]) {
        throw new Error("Invalid TopoJSON structure");
    }

    // topojson.feature の呼び出し（型定義回避のため any キャスト）
    const featureFunc = (topojson as any).feature || topojson; 
    const geojson = featureFunc(topology, topology.objects[objectKey]);
    const features = (geojson as any).features;

    if (!features || features.length === 0) {
        throw new Error("No features found in TopoJSON");
    }

    // 沖縄 (ID: 47) を探す
    // IDプロパティはソースによって 'id', 'code', 'prefecture' など異なる場合がある
    // 名前でのマッチングも試みる
    const findFeature = (code: number, name: string) => {
      return features.find((f: any) => {
        const props = f.properties;
        const id = props.id || props.code || props.prefecture;
        // ID一致
        if (Number(id) === code) return true;
        // 名前一致 (漢字)
        if (props.nam_ja && props.nam_ja === name) return true;
        if (props.name && props.name === name) return true;
        return false;
      });
    };

    const okinawaFeature = findFeature(47, "沖縄");
    
    // 本州（沖縄以外）
    const mainlandFeatures = features.filter((f: any) => {
        const props = f.properties;
        const id = Number(props.id || props.code || props.prefecture);
        return id !== 47;
    });

    // 1. メイン投影 (本州)
    // 左上に沖縄用のスペースを空けるため、右下に寄せる調整
    const projectionMain = d3.geoMercator()
      .fitExtent([[50, 200], [950, 980]], { type: "FeatureCollection", features: mainlandFeatures } as any);
    
    const pathGeneratorMain = d3.geoPath().projection(projectionMain);

    // 2. インセット投影 (沖縄)
    // 左上のボックス [110, 110] - [250, 210] あたりに収める
    let pathGeneratorOkinawa: any = null;
    if (okinawaFeature) {
        const projectionOkinawa = d3.geoMercator()
        .fitExtent([[120, 120], [240, 200]], okinawaFeature);
        pathGeneratorOkinawa = d3.geoPath().projection(projectionOkinawa);
    }

    // PREFECTURESデータにパス情報を結合
    const enrichedPrefectures = PREFECTURES.map(pref => {
      const feature = findFeature(pref.code, pref.name);
      
      if (!feature) {
        return pref;
      }

      // ジェネレーター選択
      let generator = pathGeneratorMain;
      if (pref.code === 47 && pathGeneratorOkinawa) {
          generator = pathGeneratorOkinawa;
      }
      
      const path = generator(feature);
      
      if (!path) return pref;

      // 重心とバウンディングボックス計算
      const bounds = generator.bounds(feature); // [[x0, y0], [x1, y1]]
      const centroid = generator.centroid(feature);

      return {
        ...pref,
        path: path,
        centerX: centroid[0],
        centerY: centroid[1],
        bbox: {
          x: bounds[0][0],
          y: bounds[0][1],
          width: bounds[1][0] - bounds[0][0],
          height: bounds[1][1] - bounds[0][1]
        }
      };
    });

    return enrichedPrefectures;

  } catch (error) {
    console.error("Error processing map data:", error);
    return PREFECTURES;
  }
};
