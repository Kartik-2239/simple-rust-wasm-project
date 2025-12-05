use wasm_bindgen::prelude::*;
// use image::{GenericImageView, ImageBuffer, Rgba};

pub struct Img<'a> {
    data: &'a mut [u8]
}

impl<'a> Img<'a>{
    pub fn new(data: &'a mut [u8]) -> Self {
        Self { data }
    }

    #[inline]
    fn for_each_pixel<F>(&mut self, mut f: F)
    where
        F: FnMut(f32, f32, f32) -> (u8, u8, u8),
    {
        for i in (0..self.data.len()).step_by(4) {
            let r = self.data[i] as f32;
            let g = self.data[i+1] as f32;
            let b = self.data[i+2] as f32;

            let (new_r,new_g,new_b) = f(r,g,b);

            self.data[i] = new_r;
            self.data[i+1] = new_g;
            self.data[i+2] = new_b;
        }
    }

    fn adjust_opacity(&mut self, intensity: f32){
        self.for_each_pixel(|r,g,b| {
            let k = intensity/100.0;
            let r_new = ((255.0 - r) * k + r).clamp(0.0, 255.0) as u8;
            let g_new = ((255.0 - g) * k + g).clamp(0.0, 255.0) as u8;
            let b_new = ((255.0 - b) * k + b).clamp(0.0, 255.0) as u8;
            (r_new,g_new,b_new)
        });
    }

    fn switch_gray_scale(&mut self){
        self.for_each_pixel(|r,g,b|{
            let gray = (0.299*r + 0.587*g + 0.114*b) as u8;
            (gray,gray,gray)
        });
    }

    fn adjust_brightness(&mut self, value: f32){
        self.for_each_pixel(|r,g,b|{
            let r1 =  (r+value).clamp(0.0, 255.0) as u8;
            let g1 = (g+value).clamp(0.0, 255.0) as u8;
            let b1 = (b+value).clamp(0.0, 255.0) as u8;
            (r1,g1,b1)
        });
    }

    fn adjust_contrast(&mut self, value: f32){
        let contrast = value/100.0;
        self.for_each_pixel(|r,g,b|{
            let r1 = ((r-128.0)*contrast + 128.0).clamp(0.0, 255.0) as u8;
            let g1 = ((g-128.0)*contrast + 128.0).clamp(0.0, 255.0) as u8;
            let b1 = ((b-128.0)*contrast + 128.0).clamp(0.0, 255.0) as u8;
            (r1,g1,b1)
        });
    }

    fn adjust_saturation(&mut self, value: f32){
        let k = value/100.0;
        self.for_each_pixel(|r,g,b|{
            let l = 0.3*r+0.59*g+0.11*b;
            let r1 = (r + (r-l)*k).clamp(0.0,255.0) as u8;
            let g1 = (g + (g-l)*k).clamp(0.0,255.0) as u8;
            let b1 = (b + (b-l)*k).clamp(0.0,255.0) as u8;
            (r1,g1,b1)
        });
    }
}


#[wasm_bindgen]
pub fn opacity(data: &mut [u8], intensity: f32) {
    Img::new(data).adjust_opacity(intensity);
}

#[wasm_bindgen]
pub fn black_and_white(data: &mut [u8]){
    Img::new(data).switch_gray_scale();
}

#[wasm_bindgen]
pub fn brightness(data: &mut [u8], value: f32){
    Img::new(data).adjust_brightness(value);
}

#[wasm_bindgen]
pub fn contrast(data: &mut [u8], value: f32){
    Img::new(data).adjust_contrast(value);
}

#[wasm_bindgen]
pub fn saturation(data: &mut [u8], value: f32){
    Img::new(data).adjust_saturation(value);
}

// #[wasm_bindgen]
// pub fn pixels(data: &mut [u8], value: f32){
//     for i in (0..data.len()).step_by(4){

//     }
// }
