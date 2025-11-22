

// import { VegaEmbed } from "react-vega";
// // import type { VisualizationSpec } from "vega-lite";
// import type { EmbedOptions } from "vega-embed";

// export function SqlChart({ data }: { data: any[] }) {
//   // Vega-Lite spec using inline values (typed)
//   const spec: any = {
//   $schema: "https://vega.github.io/schema/vega-lite/v5.json",
//   description: "Songs per genre bar chart",
//   background: "transparent",

//   data: { values: data },

//   mark: {
//     type: "bar ",
    
//     cornerRadiusTopLeft: 4,
//     cornerRadiusTopRight: 4,
//   },

//   encoding: {
//     x: {
//       field: "Genre",
//       type: "nominal",
//       sort: "-y",
//       axis: {
//         title: "Genre",
//         labelAngle: -20,
//         labelFontSize: 12,
//         titleFontSize: 14,
//         grid: false
//       }
//     },

//     y: {
//       field: "SongCount",
//       type: "quantitative",
//       axis: {
//         title: "Song Count",
//         labelFontSize: 12,
//         titleFontSize: 14,
//         gridColor: "#44444422"
//       }
//     },

//     color: {
//       value: "#27272a"  // Indigo-600 — looks beautiful in ShadCN
//     },

//     tooltip: [
//       { field: "Genre", type: "nominal" },
//       { field: "SongCount", type: "quantitative" }
//     ]
//   },

//   padding: 10,
// };


//   const options: EmbedOptions = {
//     actions: false,
//     mode: "vega-lite",
//     width:700
//   };

//   return (
//     <div className="w-full overflow-x-auto">
//       <VegaEmbed spec={spec} options={options} />
//     </div>
//   );
// }

export default function Page() {
  return (
    <div className="p-6 space-y-6">
      {/* <SqlChart
        data={[
          { Genre: "Rock", SongCount: 129 },
          { Genre: "Jazz", SongCount: 80 },
        
          { Genre: "Metal", SongCount: 55 }
        ]}
      /> */}

      <div className="text-xl font-semibold">Hello Workspace</div>
    </div>
  );
}
