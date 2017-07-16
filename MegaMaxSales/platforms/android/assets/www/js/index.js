/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
  // Application Constructor
  initialize: function () {
    document.addEventListener(
      'deviceready',
      this.onDeviceReady.bind(this),
      false
    )
  },

  // deviceready Event Handler
  //
  // Bind any cordova events here. Common events are:
  // 'pause', 'resume', etc.
  onDeviceReady: function () {
    this.receivedEvent('deviceready')
  },

  // Update DOM on a Received Event
  receivedEvent: function (id) {
    // Needed to build drop down.
    GetAllClientsList();

    // Needed to build catalogue
    GetAllWidgetList();

    // Used for DEBUG.
    GetAllOrderList();
    GetAllOrderItemsList();

    // Initial show map
    UpdateMap(markersArray);

    // Home Page event handlers for the buttons.
    $(document).on('click', '#loginBtn', function () {
      LoginBtn();
    });

    $(document).on('click', '#logoutBtn', function () {
      LogoutBtn();
    });

    $(document).on('click', '#exitAppBtn', function () {
      ExitAppBtn();
    });

    // Orders Page event handlers for the buttons.
    $(document).on('change', '#selectClientID', function () {
      SetClientID();
    });

    $(document).on('click', '#addToOrderBtn', function () {
      AddToOrderItems(clientID);
    });

    $(document).on('click', '#createNewOrderBtn', function () {
      CreateNewOrder();
    });

    $(document).on('click', '#updateMarkersBtn', function () {
      UpdateMap(markersArray);
    });

  }
}

app.initialize();

// ----------------------------------------------------------------------------------------

/*
 * Custom js code for question 2.
/*

/*
 * Updating the Map location according to an address
 * @param {type} address
 * @returns {undefined}
*/
function UpdateMap(idArray) {

  console.log("address: " + idArray);

  var onSuccess = function (position) {
    var div = document.getElementById('map_canvas');

    div.width = window.innerWidth - 20;
    div.height = window.innerHeight * 0.8 - 40;

    var map = plugin.google.maps.Map.getMap(div);
    plugin.google.maps.Map.setDiv(div);

    map.addEventListener(plugin.google.maps.event.MAP_READY, onMapReady, false);

    function onMapReady() {
      var currentLocation = new plugin.google.maps.LatLng(
        position.coords.latitude,
        position.coords.longitude
      );

      map.setOptions({
        backgroundColor: 'white',
        mapType: plugin.google.maps.MapTypeId.ROAD,
        controls: {
          compass: true,
          myLocationButton: true,
          indoorPicker: true,
          zoom: true // Only for Android
        },
        gestures: {
          scroll: true,
          tilt: true,
          rotate: true,
          zoom: true
        },
        camera: {
          latLng: currentLocation,
          tilt: 30,
          zoom: 10,
          bearing: 50
        }
      });

      // At this point address = markersArray. Simply an array of client id's
      if (idArray != undefined) {

        console.log("Address set: " + idArray);

        for (var i = 0; i < idArray.length; i++) {
          var name = allClientsList.data[i].name;
          var address = allClientsList.data[i].address;
          console.log('name: ' + name);
          console.log('address: ' + address);

          // Nativegeocoder reverse lookup: address -> lat/long
          nativegeocoder.forwardGeocode(success, failure, address);

          function success(coordinates) {
            // Get a new map object of location.
            var loc = new plugin.google.maps.LatLng(coordinates.latitude, coordinates.longitude)

            map.addMarker({
                position: loc,
                title: 'Company: ' + name
              },
              function (marker) {
                marker.showInfoWindow()
              }
            )
          };

          map.refreshLayout();

          // Nativegeocoder fail.
          function failure(err) {
            alert(JSON.stringify(err));
          }
        }
      }

      // My location.
      map.addMarker({
          position: currentLocation,
          title: 'I am here!'
        },
        function (marker) {
          marker.showInfoWindow()
        }
      )
    }
  }

  var onError = function (error) {
    alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
  }

  navigator.geolocation.getCurrentPosition(onSuccess, onError, {
    enableHighAccuracy: true
  });
}

/*
 * Variable section.
 */
var username;
var password;

var clientID; // Temp from the 'clientList'
var ordersID; // id from orders table. ie. 4171

// Orders page html build.
var clientTimestamp;
var clientCompany;
var clientAddress;

var currentWidget = 0; // Index value.

// Map
var markersArray = []; // array to keep list of client id's of orders created today.

var allClientsList = null; // id, name, address, phone and email.
var allOrdersList = null; // id, client_id, date, latitude, longitude
var allOrderItemsList; // id, orders_id, widget_id, number, pence_price
var allWidgetsList = null; // id, url, pence_price and description

// Temp
var ordersListByID = null;

/*
 * Set the clientID from change in the html.
 */
function SetClientID() {
  // Get the html id value.
  clientID = document.getElementById('selectClientID').value;
  // Set the clientID in the html id.
  document.getElementById('clientID').value = clientID;

  var selectedObject = FilterById(allClientsList['data'], clientID);
  clientCompany = selectedObject.name;
  clientAddress = selectedObject.address;
}

/*
 * Search json by id.
 * @param {type} json array ptr.
 * @param {type} json array key/value.
 * @returns {obj}
 */
function FilterById(jsonObject, id) {
  return jsonObject.filter(function (jsonObject) {
    return jsonObject['id'] == id;
  })[0]
}

// YOU SHOULD d/l new allOrdersByDate
function GetOrdersByDate() {
  // Get todays time stamp
  var d = new Date();

  var month = d.getMonth() + 1;
  var day = d.getDate();

  var today =
    d.getFullYear() +
    '-' +
    (month < 10 ? '0' : '') +
    month +
    '-' +
    (day < 10 ? '0' : '') +
    day;

  console.log('today: ' + today);

  // Update orders from the api; to include the one we have just made.
  GetAllOrderList();

  for (i = 0; i < allOrdersList.data.length; i++) {
    var timestamp = allOrdersList.data[i].date.substring(0, 10);

    if (timestamp == today) {
      // Now we have a match add to a created array for markersArray
      markersArray.push(allOrdersList.data[i].client_id);
      console.log('MATCH');
    }
  }
}

/*
 * Download from api all from order_table.
 * @param {type} client id to get.
 * @returns {NONE}
 */
function GetOrdersListById(clientID) {
  // We need to create a new order first!
  $.get(
    'http://137.108.93.222/openstack/api/order', {
      OUCU: 'dt5293',
      password: 'hMNd4e9k',
      client_id: clientID
    },
    function (data) {
      ordersListByID = $.parseJSON(data)

      if (ordersListByID.status == 'fail') {
        alert('Fail: ' + ordersListByID.data[0].reason)
      }
    }
  )
}

/*
 * Helper methods to check username for FR 1.1
 */
function isLetter(str) {
  return str.length === 1 && str.match(/[a-z]/i);
}

function isNumber(str) {
  return str.length === 1 && str.match(/[0-9]/);
}

/*
 * Check the current users credentials.
 * @param {NONE} gets username from html.
 * @param {NONE} get password from html.
 * @returns {NONE}
 *
 * FR 1.1 Credential validation.
 */
function LoginBtn() {
  username = $('#username').val();
  password = $('#password').val();

  if (!(isLetter(username.charAt(0)) &&
      isNumber(username.charAt(username.length - 1)))) {
    alert('Salesperson enter is not valid!');
  } else {
    $.mobile.pageContainer.pagecontainer('change', 'index.html#ordersPage', {
      transition: 'slide'
    });
  }
}

/*
 * Logout the current user.
 */
function LogoutBtn() {
  ClearSession();
  alert("Successfully logged out.");
}

/*
 * Exit the application.
 */
function ExitAppBtn() {
  ClearSession();
  navigator.app.exitApp();
}

/*
 * Clear the sessio ID.
 */
function ClearSession() {
  // Not implemented yet.
}

/*
 * Get the widget list from url and store in widgetList.
 * @param {NONE}.
 * @returns {obj} id, url, pence_price and description.
 *
 */
function GetAllWidgetList() {
  $.get(
    'http://137.108.93.222/openstack/api/widgets?OUCU=user1&password=password',
    function (data) {
      allWidgetsList = $.parseJSON(data)

      if (allWidgetsList.status == 'fail') {
        alert('Get widgets: ' + allWidgetsList.data[0].reason);
      } else {
        // Set defualt widget details
        UpdateWidgetDetails(allWidgetsList.data[currentWidget]);
      }
    }
  )
}

/*
 * Get the client list from url and store in clientList.
 * Returns: id, name, address, phone and email.
 */
function GetAllClientsList() {
  $.get(
    'http://137.108.93.222/openstack/api/clients?OUCU=dt5293&password=hMNd4e9k',
    function (data) {
      allClientsList = $.parseJSON(data);

      if (allClientsList.status == 'fail') {
        alert('Get client list: ' + allClientsList.data[0].reason);
      } else {
        // Build dropdown.
        for (i = 0; i < allClientsList.data.length; i++) {
          $('#selectClientID').append(
            '<option value=' +
            allClientsList.data[i].id +
            '>' +
            allClientsList.data[i].name +
            '</option>'
          );
        }
      }
    }
  )
}

/*
 * Get order items from api.
 */
function GetAllOrderItemsList() {
  $.get(
    'http://137.108.93.222/openstack/api/order_items?OUCU=dt5293&password=hMNd4e9k',
    function (data) {
      allOrderItemsList = $.parseJSON(data);

      if (allOrderItemsList.status == 'fail') {
        alert('Fail: ' + allOrderItemsList.data[0].reason);
      } else return true;
    }
  )
}

function CreateNewOrder() {
  // Do we have a valid client?
  if (!$.isNumeric(clientID)) {
    alert(
      'You need to select client from the dropdown list in the Orders Page.'
    );
  } else {
    $.post(
      'http://137.108.93.222/openstack/api/orders', {
        OUCU: 'dt5293',
        password: 'hMNd4e9k',
        client_id: clientID,
        latitude: '88',
        longitude: '88'
      },
      function (data) {
        obj1 = $.parseJSON(data)

        if (obj1.status == 'fail') {
          alert('Creating new order failed: ' + obj1.data[0].reason)
        } else {
          alert('A new order has been created.')
          ordersID = obj1.data[0].id
          clientTimestamp = obj1.data[0].date
        }
      }
    )
    // Do we have a timestamp?
    WaitForTimestamp();

    // Sets markersArray
    GetOrdersByDate();
    UpdateMap(markersArray);
  }
}

/**
 * Helper to wait timestamp to be set before appending timestamp, company and address.
 */
function WaitForTimestamp() {
  if (typeof clientTimestamp !== 'undefined') {
    // Build order view title.
    BuildOrderviewTitle();
    // variable exists, do what you want
    $('#timestamp')
      .empty()
      .append('<p>' + 'Timestamp: ' + clientTimestamp + '</p>');
    $('#company').empty().append('<p>' + 'Company: ' + clientCompany + '</p>');
    $('#address').empty().append('<p>' + 'Address: ' + clientAddress + '</p>');
  } else {
    setTimeout(WaitForTimestamp, 250);
  }
}

/*
 * FR 1.3
 * Add current widget to the order_items table.
 * id, order_id, widget_id, numer, pence_price
 */

var obj1;
var obj2;
var isFirstRun = true;

function AddToOrderItems(clientID) {
  // FR 1.3
  // Add current widget to the order items, inc amount and agreed price.

  // Do we have a valid client?
  if (!$.isNumeric(clientID)) {
    alert(
      'You need to select client from the dropdown list in the Orders Page.'
    );
    return;
  }

  var number = document.getElementById('number').value;

  // Do we have a valid number int?
  if (!$.isNumeric(number)) {
    alert('Error: invalid quantity - must be an integer.');
    document.getElementById('number').value = '';
    return;
  } else if (number < 1) {
    // Do we have a valid qty?
    alert('Error: quantity must be at least 1.');
    document.getElementById('number').value = '';
    return;
  }

  var discount = document.getElementById('discount').value;
  var askingPrice = allWidgetsList.data[currentWidget].pence_price;

  // Is the discount field set?
  if (discount.length != 0) {
    // Do we have a valid discount int?
    if (!$.isNumeric(discount)) {
      alert('Error: invalid discount price - must be an integer.');
      document.getElementById('discount').value = '';
      return;
    }
    // Is it less than actual price?
    if (discount > askingPrice) {
      alert('Discount price must be lower than asking price.');
      document.getElementById('discount').value = '';
      return;
    }

    // Set the price based on lower.
    var price = discount > askingPrice ? askingPrice : discount;
  } else {
    var price = askingPrice;
  }

  var widgetID = document.getElementById('widgetID').value;

  $.post(
    'http://137.108.93.222/openstack/api/order_items', {
      OUCU: 'dt5293',
      password: 'hMNd4e9k',
      order_id: ordersID,
      widget_id: widgetID,
      number: number,
      pence_price: price
    },
    function (data) {
      obj2 = $.parseJSON(data)

      if (obj2.status == 'fail') {
        alert('Add To Order List Failed: ' + obj2.data[0].reason);
      } else {
        alert('Item added to order.' + '\n\n' + 'Check Orders Page.');

        AppendOrderLine(number, widgetID, price);

        // Reset html form, number and discount.
        ClearUserFields();
      }
    }
  )

  if (isFirstRun) {
    isFirstRun = false;

    // Build order view header.
    BuildOrderviewHeader();
    // Build order view summary.
    BuildOrderviewSummary();
  }
}

/**
 * Build the html tags for the orderview title.
 */
function BuildOrderviewTitle() {
  $('#orderviewTitle').append(
    '<div id="timestamp">Timestamp: </div>' +
    '<div id="company">Company: </div>' +
    '<div id="address">Address: </div>' +
    '<br>'
  )
}

/**
 * Build the html tags for the orderview header.
 */
function BuildOrderviewHeader() {
  $('#orderviewHeader').append(
    '<div class="ui-grid-d" style="font-size:8px">' +
    '<div class="ui-block-a"><div class="ui-bar ui-bar-a">Quantity:</div></div>' +
    '<div class="ui-block-b"><div class="ui-bar ui-bar-a">Widgets ID:</div></div>' +
    '<div class="ui-block-c"><div class="ui-bar ui-bar-a">Widget Cost:</div></div>' +
    '<div style="float: right">' +
    '<div class="ui-block-d"><div class="ui-bar ui-bar-a">Total:</div></div>' +
    '</div>' +
    '</div>'
  )
}

var subtotal = 0;
var vat = 0;
var total = 0;
var lat = 0;
var lon = 0;

/**
 * Build our html tags for the orderview summary.
 *
 * Pre FR 1.4 Display the sum of ordered items and adding VAT to the agreed price of each item at 20%
 */
function BuildOrderviewSummary() {
  $('#orderviewSummary').append(
    '<div class="ui-grid-d" style="font-size:8px">' +
    '<div style="float: left">' +
    '<div class="ui-block-a"><div class="ui-bar ui-bar-a">' +
    'Subtotal' +
    '</div></div>' +
    '</div>' +
    '<div style="float: right">' +
    '<div class="ui-block-d"><div class="ui-bar ui-bar-a" id="subtotal">' +
    subtotal +
    '</div></div>' +
    '</div>' +
    '</div>' +
    '<div class="ui-grid-d" style="font-size:8px">' +
    '<div style="float: left">' +
    '<div class="ui-block-a"><div class="ui-bar ui-bar-a">' +
    'VAT' +
    '</div></div>' +
    '</div>' +
    '<div style="float: right">' +
    '<div class="ui-block-d"><div class="ui-bar ui-bar-a" id="vat">' +
    vat +
    '</div></div>' +
    '</div>' +
    '</div>' +
    '<div class="ui-grid-d" style="font-size:8px">' +
    '<div style="float: left">' +
    '<div class="ui-block-a"><div class="ui-bar ui-bar-a">' +
    'Total' +
    '</div></div>' +
    '</div>' +
    '<div style="float: right">' +
    '<div class="ui-block-d"><div class="ui-bar ui-bar-a" id="total">' +
    total +
    '</div></div>' +
    '</div>' +
    '</div>' +
    '<div class="ui-grid-d" style="font-size:8px">' +
    '<div style="float: left">' +
    '<div class="ui-block-a"><div class="ui-bar ui-bar-a">' +
    'Latitude' +
    '</div></div>' +
    '</div>' +
    '<div style="float: right">' +
    '<div class="ui-block-d"><div class="ui-bar ui-bar-a" id="lat">' +
    lat +
    '</div></div>' +
    '</div>' +
    '</div>' +
    '<div class="ui-grid-d" style="font-size:8px">' +
    '<div style="float: left">' +
    '<div class="ui-block-a"><div class="ui-bar ui-bar-a">' +
    'Longitude' +
    '</div></div>' +
    '</div>' +
    '<div style="float: right">' +
    '<div class="ui-block-d"><div class="ui-bar ui-bar-a" id="lon">' +
    lon +
    '</div></div>' +
    '</div>' +
    '</div>'
  )
}

/**
 * Append to div our new item details.
 *
 * @param {*} quantity of widgets requiered
 * @param {*} widgetID identification of widget
 * @param {*} widgetPrice the agreed price
 *
 * FR 1.4 Display the sum of ordered items and adding VAT to the agreed price of each item at 20%
 */
function AppendOrderLine(quantity, widgetID, widgetPrice) {
  var lineTotal = parseFloat(widgetPrice * quantity / 100).toFixed(2);

  // Increment subtotal with new price and convert to float.
  subtotal += widgetPrice * quantity / 100;

  // Calc vat As float
  var tmpVat = subtotal / 100 * 20;

  // Add as float on float
  var tmpTotal = subtotal + tmpVat;

  // Convert to string
  subtotalStr = parseFloat(subtotal).toFixed(2);

  // Convert to string
  vatStr = parseFloat(tmpVat).toFixed(2);

  // Convert to string
  totalStr = parseFloat(tmpTotal).toFixed(2);

  $('#subtotal').text(subtotalStr);
  $('#vat').text(vatStr);
  $('#total').text(totalStr);

  // Append table header
  $('#orderviewItems').append(
    '<div class="ui-grid-d" style="font-size:8px">' +
    '<div class="ui-block-a"><div class="ui-bar ui-bar-a">' +
    quantity +
    '</div></div>' +
    '<div class="ui-block-b"><div class="ui-bar ui-bar-a">' +
    widgetID +
    '</div></div>' +
    '<div class="ui-block-c"><div class="ui-bar ui-bar-a">' +
    widgetPrice +
    '</div></div>' +
    '<div style="float: right">' +
    '<div class="ui-block-d"><div class="ui-bar ui-bar-a">' +
    lineTotal +
    '</div></div>' +
    '</div>' +
    '</div>'
  );
}

/**
 * Get orders from api.
 */
function GetAllOrderList() {
  $.get(
    'http://137.108.93.222/openstack/api/orders?OUCU=dt5293&password=hMNd4e9k',
    function (data) {
      allOrdersList = $.parseJSON(data);

      if (allOrdersList.status == 'fail') {
        alert('Fail: ' + allOrdersList.data[0].reason);
      }
    }
  )
}

/**
 * Check not zero before decrementing the index.
 * Update widget information.
 */
function PreviousWidget() {
  if (currentWidget > 0) currentWidget--;
  UpdateWidgetDetails(allWidgetsList.data[currentWidget]);
}

/**
 * Check not greater than the max before incrementing index.
 * Update widget information.
 */
function NextWidget() {
  if (currentWidget < allWidgetsList.data.length) currentWidget++;
  UpdateWidgetDetails(allWidgetsList.data[currentWidget]);
}

/**
 * Update the widget details; picture, price, number and description.
 * @param {*} currentWidget pointer to our index.
 */
function UpdateWidgetDetails(currentWidget) {
  var canvas = document.getElementById('widget_canvas');
  var ctx = canvas.getContext('2d');
  var image = new Image();
  image.src = currentWidget.url;
  image.onload = function () {
    ctx.drawImage(image, 0, 0)
    ctx.drawImage(
      image,
      0,
      0,
      image.width,
      image.height, // source rectangle
      0,
      0,
      canvas.width,
      canvas.height
    ) // destination rectangle
  }

  // Set the widget specifications.
  $('#askingPrice').val(currentWidget.pence_price);
  $('#widgetID').val(currentWidget.id);
  $('#description').val(currentWidget.description);

  ClearUserFields();
}

/**
 * Clear our number and price fields for page transition.
 */
function ClearUserFields() {
  document.getElementById('number').value = '';
  document.getElementById('discount').value = '';
}