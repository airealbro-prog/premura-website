// US geography for solar territory map.
// Simplified continental US outline + state borders + major metro centroids.
// Coordinates in viewBox 0 0 1000 600 (roughly equirectangular projection of CONUS).
// Hand-traced from a public-domain reference, accurate enough to read as USA.

window.US_GEO = {
  // Continental US outer silhouette — recognizable shape
  outline: "M 80 280 L 95 250 L 110 225 L 130 210 L 150 195 L 175 180 L 200 168 L 230 158 L 260 152 L 295 148 L 330 145 L 370 142 L 410 140 L 450 138 L 490 138 L 525 138 L 555 140 L 580 145 L 605 152 L 625 158 L 645 162 L 670 162 L 695 158 L 720 150 L 745 142 L 770 138 L 795 142 L 815 152 L 830 168 L 845 188 L 858 215 L 870 245 L 880 275 L 888 305 L 894 335 L 898 360 L 902 380 L 905 395 L 905 408 L 900 415 L 890 418 L 875 415 L 858 405 L 838 392 L 815 378 L 792 365 L 770 358 L 755 360 L 745 372 L 738 385 L 730 395 L 718 402 L 700 405 L 678 405 L 658 402 L 640 405 L 625 415 L 615 428 L 608 438 L 605 448 L 605 460 L 612 472 L 622 480 L 628 488 L 628 498 L 622 506 L 610 510 L 595 510 L 580 505 L 568 498 L 558 488 L 552 475 L 548 460 L 545 442 L 540 425 L 530 412 L 518 402 L 502 395 L 482 392 L 462 395 L 442 402 L 422 412 L 405 425 L 392 440 L 385 455 L 382 470 L 385 485 L 392 498 L 402 505 L 412 508 L 412 515 L 402 518 L 388 518 L 372 512 L 355 502 L 338 488 L 322 472 L 308 455 L 295 438 L 282 420 L 268 402 L 252 385 L 235 370 L 218 358 L 200 348 L 182 342 L 165 340 L 150 342 L 138 348 L 128 358 L 120 370 L 115 382 L 112 392 L 108 398 L 102 398 L 95 392 L 92 380 L 92 365 L 92 348 L 92 332 L 92 315 L 90 300 L 85 290 Z",

  // State borders — major divisions only (not every state, just the visually-important ones)
  // Drawn as thin lines inside the outline
  borders: [
    // East-west: Mason-Dixon line area / Ohio River
    "M 660 250 L 700 252 L 740 255 L 770 260",
    // Mississippi River
    "M 540 145 L 542 175 L 545 210 L 548 245 L 552 280 L 555 310 L 558 340 L 562 370 L 568 395 L 575 415",
    // Texas/Oklahoma border
    "M 380 290 L 410 295 L 440 298 L 470 300",
    // Texas/Louisiana
    "M 470 300 L 488 320 L 510 340 L 528 360",
    // Mountain west / 105th meridian (CO/UT)
    "M 280 175 L 282 220 L 285 265 L 288 310",
    // CA/NV
    "M 145 200 L 148 240 L 152 280 L 158 320 L 165 360",
    // CO/NM
    "M 285 290 L 320 295 L 355 300",
    // Northern tier (Dakotas/Minnesota)
    "M 380 142 L 425 145 L 470 148 L 515 150",
    // Great Lakes (suggest with curve)
    "M 600 175 L 620 185 L 645 190 L 670 188 L 690 180",
    // FL panhandle separator
    "M 700 405 L 720 410 L 740 415",
    // PNW (WA/OR)
    "M 130 175 L 140 210",
    // ID/MT
    "M 200 165 L 210 200 L 218 235",
  ],

  // Major lakes (Great Lakes shape) — drawn as water
  lakes: "M 605 180 L 625 178 L 650 180 L 672 178 L 690 175 L 700 178 L 700 188 L 692 195 L 678 198 L 660 200 L 642 200 L 625 198 L 612 192 Z",

  // Metro centroids — { x, y, name, region, weights: {rural, gated, spanish, highvalue} }
  // Weights 0-3 indicate how heavily that metro matches each filter
  metros: [
    // Northeast
    { x: 815, y: 215, name: "Boston",        region: "NE", lng:-71.06, lat:42.36, w: { rural: 1, gated: 2, spanish: 1, highvalue: 3 } },
    { x: 800, y: 240, name: "NYC",           region: "NE", lng:-74, lat:40.71, w: { rural: 0, gated: 2, spanish: 3, highvalue: 3 } },
    { x: 785, y: 258, name: "Philadelphia",  region: "NE", lng:-75.16, lat:39.95, w: { rural: 1, gated: 1, spanish: 2, highvalue: 2 } },
    { x: 760, y: 270, name: "DC",            region: "NE", lng:-77.04, lat:38.91, w: { rural: 0, gated: 2, spanish: 2, highvalue: 3 } },
    { x: 815, y: 195, name: "Hartford",      region: "NE", lng:-72.68, lat:41.76, w: { rural: 1, gated: 2, spanish: 2, highvalue: 2 } },
    // Mid-Atlantic / Southeast
    { x: 745, y: 295, name: "Richmond",      region: "SE", lng:-77.44, lat:37.54, w: { rural: 2, gated: 1, spanish: 1, highvalue: 1 } },
    { x: 730, y: 330, name: "Charlotte",     region: "SE", lng:-80.84, lat:35.23, w: { rural: 2, gated: 2, spanish: 2, highvalue: 2 } },
    { x: 715, y: 345, name: "Charleston",    region: "SE", lng:-79.93, lat:32.78, w: { rural: 2, gated: 2, spanish: 1, highvalue: 2 } },
    { x: 695, y: 365, name: "Atlanta",       region: "SE", lng:-84.39, lat:33.75, w: { rural: 2, gated: 2, spanish: 2, highvalue: 2 } },
    { x: 700, y: 395, name: "Jacksonville",  region: "SE", lng:-81.66, lat:30.33, w: { rural: 2, gated: 2, spanish: 2, highvalue: 2 } },
    { x: 720, y: 425, name: "Orlando",       region: "SE", lng:-81.38, lat:28.54, w: { rural: 2, gated: 3, spanish: 3, highvalue: 2 } },
    { x: 730, y: 460, name: "Tampa",         region: "SE", lng:-82.46, lat:27.95, w: { rural: 2, gated: 3, spanish: 3, highvalue: 2 } },
    { x: 758, y: 478, name: "Miami",         region: "SE", lng:-80.19, lat:25.76, w: { rural: 1, gated: 3, spanish: 3, highvalue: 3 } },
    // South
    { x: 615, y: 360, name: "Nashville",     region: "S", lng:-86.78, lat:36.16, w: { rural: 3, gated: 1, spanish: 1, highvalue: 1 } },
    { x: 600, y: 395, name: "Birmingham",    region: "S", lng:-86.81, lat:33.52, w: { rural: 3, gated: 1, spanish: 1, highvalue: 1 } },
    { x: 575, y: 405, name: "New Orleans",   region: "S", lng:-90.07, lat:29.95, w: { rural: 2, gated: 1, spanish: 2, highvalue: 1 } },
    { x: 540, y: 395, name: "Houston",       region: "S", lng:-95.37, lat:29.76, w: { rural: 2, gated: 2, spanish: 3, highvalue: 2 } },
    { x: 510, y: 380, name: "Austin",        region: "S", lng:-97.74, lat:30.27, w: { rural: 2, gated: 2, spanish: 3, highvalue: 3 } },
    { x: 485, y: 360, name: "San Antonio",   region: "S", lng:-98.49, lat:29.42, w: { rural: 2, gated: 1, spanish: 3, highvalue: 1 } },
    { x: 475, y: 330, name: "Dallas",        region: "S", lng:-96.8, lat:32.78, w: { rural: 2, gated: 2, spanish: 3, highvalue: 2 } },
    { x: 445, y: 305, name: "Oklahoma City", region: "S", lng:-97.52, lat:35.47, w: { rural: 3, gated: 1, spanish: 1, highvalue: 1 } },
    // Midwest
    { x: 605, y: 240, name: "Chicago",       region: "MW", lng:-87.62, lat:41.88, w: { rural: 1, gated: 2, spanish: 3, highvalue: 2 } },
    { x: 575, y: 250, name: "St Louis",      region: "MW", lng:-90.2, lat:38.63, w: { rural: 2, gated: 1, spanish: 1, highvalue: 1 } },
    { x: 615, y: 220, name: "Milwaukee",     region: "MW", lng:-87.91, lat:43.04, w: { rural: 2, gated: 1, spanish: 2, highvalue: 1 } },
    { x: 570, y: 200, name: "Minneapolis",   region: "MW", lng:-93.27, lat:44.98, w: { rural: 3, gated: 2, spanish: 1, highvalue: 2 } },
    { x: 645, y: 245, name: "Indianapolis",  region: "MW", lng:-86.16, lat:39.77, w: { rural: 2, gated: 1, spanish: 1, highvalue: 1 } },
    { x: 670, y: 230, name: "Cleveland",     region: "MW", lng:-81.69, lat:41.5, w: { rural: 1, gated: 1, spanish: 1, highvalue: 1 } },
    { x: 660, y: 220, name: "Detroit",       region: "MW", lng:-83.05, lat:42.33, w: { rural: 1, gated: 2, spanish: 2, highvalue: 1 } },
    { x: 675, y: 260, name: "Cincinnati",    region: "MW", lng:-84.51, lat:39.1, w: { rural: 2, gated: 1, spanish: 1, highvalue: 1 } },
    { x: 540, y: 280, name: "Kansas City",   region: "MW", lng:-94.58, lat:39.1, w: { rural: 3, gated: 1, spanish: 2, highvalue: 1 } },
    { x: 510, y: 245, name: "Omaha",         region: "MW", lng:-95.93, lat:41.26, w: { rural: 3, gated: 1, spanish: 1, highvalue: 1 } },
    // Mountain West
    { x: 305, y: 255, name: "Denver",        region: "MT", lng:-104.99, lat:39.74, w: { rural: 3, gated: 2, spanish: 2, highvalue: 2 } },
    { x: 270, y: 215, name: "Salt Lake City",region: "MT", lng:-111.89, lat:40.76, w: { rural: 3, gated: 1, spanish: 1, highvalue: 1 } },
    { x: 335, y: 350, name: "Albuquerque",   region: "MT", lng:-106.65, lat:35.08, w: { rural: 3, gated: 1, spanish: 3, highvalue: 1 } },
    { x: 245, y: 340, name: "Phoenix",       region: "MT", lng:-112.07, lat:33.45, w: { rural: 3, gated: 3, spanish: 3, highvalue: 2 } },
    { x: 270, y: 365, name: "Tucson",        region: "MT", lng:-110.93, lat:32.22, w: { rural: 3, gated: 2, spanish: 3, highvalue: 1 } },
    { x: 215, y: 195, name: "Boise",         region: "MT", lng:-116.2, lat:43.62, w: { rural: 3, gated: 1, spanish: 1, highvalue: 1 } },
    { x: 235, y: 170, name: "Billings",      region: "MT", lng:-108.5, lat:45.78, w: { rural: 3, gated: 1, spanish: 1, highvalue: 1 } },
    // Pacific
    { x: 158, y: 175, name: "Seattle",       region: "PAC", lng:-122.33, lat:47.61, w: { rural: 2, gated: 2, spanish: 1, highvalue: 3 } },
    { x: 145, y: 210, name: "Portland",      region: "PAC", lng:-122.68, lat:45.52, w: { rural: 2, gated: 1, spanish: 1, highvalue: 2 } },
    { x: 155, y: 280, name: "San Francisco", region: "PAC", lng:-122.42, lat:37.77, w: { rural: 1, gated: 3, spanish: 2, highvalue: 3 } },
    { x: 145, y: 290, name: "Sacramento",    region: "PAC", lng:-121.49, lat:38.58, w: { rural: 2, gated: 2, spanish: 3, highvalue: 2 } },
    { x: 165, y: 320, name: "Fresno",        region: "PAC", lng:-119.77, lat:36.74, w: { rural: 3, gated: 1, spanish: 3, highvalue: 1 } },
    { x: 175, y: 365, name: "Los Angeles",   region: "PAC", lng:-118.24, lat:34.05, w: { rural: 1, gated: 3, spanish: 3, highvalue: 3 } },
    { x: 195, y: 385, name: "San Diego",     region: "PAC", lng:-117.16, lat:32.72, w: { rural: 1, gated: 3, spanish: 3, highvalue: 3 } },
    { x: 200, y: 350, name: "Las Vegas",     region: "PAC", lng:-115.14, lat:36.17, w: { rural: 2, gated: 3, spanish: 3, highvalue: 2 } },
  ],
};
