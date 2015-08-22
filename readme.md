# Morph Carousel - Ionic Plugin

Morph carousel is an ionic plugin that allows you to add carousel to your application. It designed to show first of all numbers.

Plugin have two pre-installed themes

Black

![alt tag](https://github.com/artemdemo/morphing-carousel-ionic/blob/master/img/morph-carousel-1.png)

White

![alt tag](https://github.com/artemdemo/morphing-carousel-ionic/blob/master/img/morph-carousel-2.png)

**Current version** 1.0

**Tested for ionic** 1.0

**Demo view App ID** f0c502da

## Usage

1. Add data to your controller:

```javascript
$scope.items = [
  { number: 1 },
  { number: 2 },
  { number: 3 },
  { number: 4 },
  { number: 5 },
  { number: 6 },
  { number: 7 },
  { number: 8 },
  { number: 9 },
  { number: 10 },
  { number: 11 },
  { number: 12 },
  { number: 13 },
  { number: 14 },
  { number: 15 }
];
$scope.selectedItem = $scope.items[2];
```

2. Add directive

```html
<morph-carousel data-items="items" on-selected="selectedItem" show-value="number"></morph-carousel>
```

* **data-items** - array of items
* **on-selected** - will contain selected item
* **show-value** - if array contain object you need to provide property that contain value that should be shown. If you want to use simple array of numbers (or strings) you can omit this parameter. 