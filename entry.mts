import { main } from "./src/main.mjs";

main();

if ((import.meta as any).hot) {
  (import.meta as any).hot.accept("./src/main.mts", (m: any) => {
    console.log("reload");
    m.reload();
  });
}
