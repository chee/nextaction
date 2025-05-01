import {defineConfig} from "vite"
import solid from "vite-plugin-solid"
import wasm from "vite-plugin-wasm"
import {VitePWA} from "vite-plugin-pwa"
import autoprefixer from "autoprefixer"
import deno from "@deno/vite-plugin"

export default defineConfig({
	plugins: [
		deno(),
		solid(),
		// @ts-expect-error this is actually a real vite plugin
		wasm(),
		VitePWA({
			registerType: "autoUpdate",
			devOptions: {
				enabled: true,
			},
			workbox: {
				maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
			},
			manifest: {
				name: "",
				short_name: "",
				description: "",
				theme_color: "#00FDBC",
			},
		}),
	],
	server: {port: 1232},
	build: {
		target: ["esnext"],
		outDir: "output",
	},
	css: {
		postcss: {
			plugins: [autoprefixer({})],
		},
	},
})
