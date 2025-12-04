import { opacity,brightness, black_and_white, contrast, saturation } from "wasm-on-web"

async function run() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    if (!canvas) {
      console.log("oops")
      return
    };
    const ctx = canvas.getContext("2d",{willReadFrequently:true});
    if (!ctx) return;
    const fileInput = document.getElementById('input-box') as HTMLInputElement
    fileInput.addEventListener("change", () => {
      console.log("asdasd")
        const file = fileInput.files?.[0];
        if (!file) return;

        const img = new Image();
        img.crossOrigin = "anonymous"; // usually safe for local files
        img.src = URL.createObjectURL(file);
        console.log(img.src)

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            const rustRange = document.getElementById('rust-range') as HTMLInputElement;
            const original = ctx.getImageData(0, 0, canvas.width, canvas.height);
            rustRange.addEventListener('input', ()=>{
              const frame = new ImageData(
                new Uint8ClampedArray(original.data),
                // new Uint8ClampedArray(ctx.getImageData(0,0,canvas.width,canvas.height).data),
                original.width,
                original.height,
              );
              ctx!.putImageData(helper(frame, canvas, Number(rustRange.value), "rust"),0,0)
            })
            const grayscaleBtn = document.getElementById('grayscale-button') as HTMLButtonElement
            grayscaleBtn.addEventListener('click', ()=>{
              const frame = new ImageData(
                // new Uint8ClampedArray(.data),
                new Uint8ClampedArray(ctx.getImageData(0,0,canvas.width,canvas.height).data),
                original.width,
                original.height,
              );
              if (grayscaleBtn.textContent === "back"){
                // ctx!.drawImage(img,0,0)
                ctx!.putImageData(original,0,0)
                grayscaleBtn.textContent = "Gray"
                return;
              }
              // ctx!.putImageData(grayscale(frame, canvas),0,0);
              ctx!.putImageData(grayscale(frame, canvas), 0 ,0);
              grayscaleBtn.textContent = "back"
            })
            const brightnessBtn = document.getElementById('brightness-button') as HTMLButtonElement
            brightnessBtn.addEventListener('input', ()=>{
              const frame = new ImageData(
                // new Uint8ClampedArray(.data),
                new Uint8ClampedArray(ctx.getImageData(0,0,canvas.width,canvas.height).data),
                original.width,
                original.height,
              );
              ctx!.putImageData(brightnessHelper(frame,canvas,Number(brightnessBtn.value)),0,0)
            })
            const contrastBtn = document.getElementById('contrast-button') as HTMLButtonElement
            contrastBtn.addEventListener('input', ()=>{
              const frame = new ImageData(
                new Uint8ClampedArray(original.data),
                // new Uint8ClampedArray(ctx.getImageData(0,0,canvas.width,canvas.height).data),
                original.width,
                original.height,
              );
              ctx!.putImageData(contrastHelper(frame,canvas,Number(contrastBtn.value)),0,0)
            })
            const saturationBtn = document.getElementById('saturation-button') as HTMLButtonElement
            saturationBtn.addEventListener('input', ()=>{
              const frame = new ImageData(
                new Uint8ClampedArray(original.data),
                // new Uint8ClampedArray(ctx.getImageData(0,0,canvas.width,canvas.height).data),
                original.width,
                original.height,
              );
              ctx!.putImageData(saturationHelper(frame,canvas,Number(saturationBtn.value)),0,0)
            })
            
            URL.revokeObjectURL(img.src);
      };
    });
}

run();


function helper(frame: any, canvas:any, intensity: number, type?: string) {
  var data = new Uint8Array(frame.data)
  if (type && type === "rust") {
    opacity(data, intensity)
  }
  else if (type && type === "js") {
    // adjustBrightness(data, intensity)
  }
  return new ImageData(new Uint8ClampedArray(data.buffer), canvas.width, canvas.height)
}

function grayscale(frame: any, canvas:any) {
  var data = new Uint8Array(frame.data);
  black_and_white(data);
  return new ImageData(new Uint8ClampedArray(data.buffer), canvas.width, canvas.height)
}

function brightnessHelper(frame:any, canvas:any, value:number){
  var data = new Uint8Array(frame.data);
  brightness(data,value);
  return new ImageData(new Uint8ClampedArray(data.buffer), canvas.width, canvas.height)
}

function contrastHelper(frame:any, canvas:any, value: number) {
  var data = new Uint8Array(frame.data);
  contrast(data, value);
  return new ImageData(new Uint8ClampedArray(data.buffer),canvas.width,canvas.height)
}

function saturationHelper(frame:any, canvas:any, value: number){
  var data = new Uint8Array(frame.data)
  saturation(data, value);
  return new ImageData(new Uint8ClampedArray(data.buffer),canvas.width,canvas.height)
}