use std::cmp::max;
use std::u32;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Cell {
    Dead,
    Alive,
}

impl Cell {
    fn toggle(&mut self) {
        *self = match *self {
            Cell::Dead => Cell::Alive,
            Cell::Alive => Cell::Dead,
        };
    }
}

#[wasm_bindgen]
pub struct World {
    width: u32,
    height: u32,
    cells: Vec<Cell>,
}

impl World {
    fn get_idx(&self, row: u32, col: u32) -> usize {
        (row * self.width + col) as usize
    }

    fn live_neighbor_count(&self, row: u32, column: u32) -> u8 {
        let mut count = 0;
        for delta_row in [self.height - 1, 0, 1].iter().cloned() {
            for delta_col in [self.width - 1, 0, 1].iter().cloned() {
                if delta_row == 0 && delta_col == 0 {
                    continue;
                }

                let neighbor_row = (row + delta_row) % self.height;
                let neighbor_col = (column + delta_col) % self.width;
                let idx = self.get_idx(neighbor_row, neighbor_col);
                count += self.cells[idx] as u8;
            }
        }
        count
    }
}

#[wasm_bindgen]
impl World {
    pub fn new() -> World {
        let width = 64;
        let height = 64;

        let cells = (0..width * height)
            .map(|i| {
                if i % 2 == 0 || i % 7 == 0 {
                    Cell::Alive
                } else {
                    Cell::Dead
                }
            })
            .collect();

        World {
            width,
            height,
            cells,
        }
    }

    pub fn width(&self) -> u32 {
        self.width
    }

    pub fn height(&self) -> u32 {
        self.height
    }

    // Pointer to the Vector in memory.
    pub fn cells(&self) -> *const Cell {
        self.cells.as_ptr()
    }

    pub fn tick(&mut self) {
        let mut next = self.cells.clone();
        for row in 0..self.width {
            for col in 0..self.height {
                let idx = self.get_idx(row, col);
                let cell = self.cells.get(idx).expect("Bad idx should never happen");
                let neighbors_count = self.live_neighbor_count(row, col);
                let next_cell = match (cell, neighbors_count) {
                    (&Cell::Alive, 0 | 1) => Cell::Dead,
                    (&Cell::Alive, 2 | 3) => Cell::Alive,
                    (&Cell::Alive, _) => Cell::Dead,
                    (Cell::Dead, 3) => Cell::Alive,
                    _ => Cell::Dead,
                };

                next[idx] = next_cell;
            }
        }
        self.cells = next;
    }

    // To add interactivity.
    pub fn toggle_cell(&mut self, row: u32, column: u32) {
        let idx = self.get_idx(row, column);
        self.cells[idx].toggle();
    }
}
