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
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function () {
        this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function (id) {
        //         var parentElement = document.getElementById(id);
        //         var listeningElement = parentElement.querySelector('.listening');
        //         var receivedElement = parentElement.querySelector('.received');
        // 
        //         listeningElement.setAttribute('style', 'display:none;');
        //         receivedElement.setAttribute('style', 'display:block;');

        //        alert('Received Event:  ' + id);

        // Needed to build drop down.
        GetAllClientsList();

        // Needed to build catalogue
        GetAllWidgetList();

        // Used for DEBUG.
        GetAllOrderList();
        GetAllOrderItemsList();
        
        // Home Page.
        $(document).on('click', '#loginBtn', function () {
            // client side stuff here
            LoginBtn();
        });

        $(document).on('click', '#logoutBtn', function () {
            // client side stuff here
            LogoutBtn();
        });

        $(document).on('click', '#exitAppBtn', function () {
            // client side stuff here
            ExitAppBtn();
        });

        // Orders Page.
        $(document).on('change', '#selectClientID', function () {
            // client side stuff here
            SetClientID();
        });

        $(document).on('click', '#addToOrderBtn', function () {
            // client side stuff here
            AddToOrderItems(clientID);
        });

    }
};

app.initialize();

// ----------------------------------------------------------------------------------------

/*
 * Custom js code for question 2.
 * 
/*

/*
 * Variable section.
*/
var selected; // Tempory holder for field content.
var username;
var password;

var clientID; // Temp from the 'clientList'
var ordersID;   // id from orders table. ie. 4171
var currentWidget = 0; // Index value.

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
    // Get the selector value.
    clientID = document.getElementById('selectClientID').value;
    // Set the clientID in the html
    document.getElementById('clientID').value = clientID;
}

/*
 * Get orders by ID from api.
 */
function GetOrdersListById(clientID) {
    // We need to create a new order first!
    $.get("http://137.108.93.222/openstack/api/order", {
            OUCU: "dt5293",
            password: "hMNd4e9k",
            client_id: clientID,
        },

        function (data) {
            ordersListByID = $.parseJSON(data);

            if (ordersListByID.status == "fail") {
                alert('Fail: ' + ordersListByID.data[0].reason);
            }
        });
}

/*
 * Check the current users credentials.
 */
function LoginBtn() {
    username = $('#username').val();
    password = $('#password').val();

    if (!(isLetter(username.charAt(0)) && isNumber(username.charAt(username.length - 1)))) {
        alert("Salesperson enter is not valid!");
    } else {
        window.location.href = "#ordersPage";
    }
}

/**
 * Helper methods to check username for FR 1.1
 */
function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
}

function isNumber(str) {
    return str.length === 1 && str.match(/[0-9]/);
}

/*
 * Logout the current user.
 */
function LogoutBtn() {
    ClearSession();
    alert(this.id + " : Successfully logged out.");
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
 * id, url, pence_price and description
 */


function GetAllWidgetList() {
    $.get('http://137.108.93.222/openstack/api/widgets?OUCU=user1&password=password',

        function (data) {
            allWidgetsList = $.parseJSON(data);

            if (allWidgetsList.status == "fail") {
                alert('Get widgets: ' + allWidgetsList.data[0].reason);
            } else {
                // Set defualt widget details
                UpdateWidgetDetails(allWidgetsList.data[currentWidget]);
            }
        });
}


/*
 * Get the client list from url and store in clientList.
 * Returns: id, name, address, phone and email.
 */
function GetAllClientsList() {
    $.get('http://137.108.93.222/openstack/api/clients?OUCU=dt5293&password=hMNd4e9k',

        function (data) {
            allClientsList = $.parseJSON(data);

            if (allClientsList.status == "fail") {
                alert('Get client list: ' + allClientsList.data[0].reason);
            } else {
                // Build dropdown.
                for (i = 0; i < allClientsList.data.length; i++) {
                    $("#selectClientID").append('<option value=' + allClientsList.data[i].id + '>' + allClientsList.data[i].name + '</option>');
                }

                //                $("#selectClientID").selectmenu('refresh', true);
            }
        });
}

/*
 * Get order items from api.
 */
function GetAllOrderItemsList() {
    $.get("http://137.108.93.222/openstack/api/order_items?OUCU=dt5293&password=hMNd4e9k",

        function (data) {
            allOrderItemsList = $.parseJSON(data);

            if (allOrderItemsList.status == "fail") {
                alert('Fail: ' + allOrderItemsList.data[0].reason);
            } else return true;
        });
}

/*
 * Add current widget to the order_items table.
 * id, order_id, widget_id, numer, pence_price
 */
function AddToOrderItems(clientID)
{
    // FR 1.3
    // Add current widget to the order items, inc amount and agreed price.

    // Do we have a valid client?
    if(!$.isNumeric(clientID))
    {
        alert("You need to select client from the dropdown list in the Orders Page.");
        return;
    }

    // NOT WORKING COME BACK TO IT!
    // We need to create a new order first!
    $.post("http://137.108.93.222/openstack/api/orders", {
            OUCU: "dt5293",
            password: "hMNd4e9k",
            client_id: clientID,
            latitude: "18",
            longitude: "18"
        },

        function (data) {
            var obj = $.parseJSON(data);

            if (obj.status == "fail")
            {
                alert('Make Order: ' + obj.data[0].reason);
            }
            else
            {
                ordersID = obj.data[0].id;
                alert("Orders table updated!");
            }
        });

    var number = document.getElementById('number').value;
    var askingPrice = document.getElementById('askingPrice').value;
    var discount = document.getElementById('discount').value;

    if (discount == null)
    {
        var price = askingPrice;
    }
    else
    {
        var price = (discount < askingPrice) ? askingPrice : discount;
    }

    $.post("http://137.108.93.222/openstack/api/order_items", {
            OUCU: "dt5293",
            password: "hMNd4e9k",
            order_id: ordersID,
            widget_id: allWidgetsList.data[currentWidget].id,
            number: number,
            pence_price: price

        },

        function (data) {
            var obj = $.parseJSON(data);

            if (obj.status == "fail") {
                alert('Make Order: ' + allWidgetsList.data[0].reason);
            }
        });

}


/*
 * Get orders from api.
 */
function GetAllOrderList() {
    $.get("http://137.108.93.222/openstack/api/orders?OUCU=dt5293&password=hMNd4e9k",

        function (data) {
            allOrdersList = $.parseJSON(data);

            if (allOrdersList.status == "fail") {
                alert('Fail: ' + allOrdersList.data[0].reason);
            }
        });
}

/*
 * Check not zero before decrementing the index.
 * Update widget information.
 */
function PreviousWidget() {
    if (currentWidget > 0) currentWidget--;
    UpdateWidgetDetails(allWidgetsList.data[currentWidget]);
}

/*
 * Check not greater than the max before incrementing index.
 * Update widget information.
 */
function NextWidget() {
    if (currentWidget < allWidgetsList.data.length) currentWidget++;
    UpdateWidgetDetails(allWidgetsList.data[currentWidget]);
}

/*
 * Update the widget details; picture, price, number and description.
 */
function UpdateWidgetDetails(currentWidget) {
    var canvas = document.getElementById("widget_canvas");
    var ctx = canvas.getContext("2d");
    var image = new Image();
    image.src = currentWidget.url;
    image.onload = function () {
        ctx.drawImage(image, 0, 0);
        ctx.drawImage(image, 0, 0, image.width, image.height, // source rectangle
            0, 0, canvas.width, canvas.height); // destination rectangle        
    };

    var num = parseInt(currentWidget.pence_price);
    var dec = (num / 100).toFixed(2);

    $('#askingPrice').val((parseInt(currentWidget.pence_price) / 100).toFixed(2));
    $('#widgetID').val(currentWidget.id);
    $('#description').val(currentWidget.description);
}




//var lineTotal = parseFloat(widgetPrice) * parseInt(quantity);
function UpdateListview() {
    // Append header
    $("#orderViewHeader").append('<p>' + "Order placed on " + this.orderDate + " @ " + this.orderTime + '</p>');
    $("#orderViewHeader").append('<p>' + "Location: " + orderAddress + '</p>');
    $("#orderViewHeader").append('<p>' + this.str + '</p>');

    // Append table header
    $("#orderViewItems").append(
        '<div class="ui-grid-d" style="font-size:8px">' +
        '<div class="ui-block-a"><div class="ui-bar ui-bar-a">Quantity:</div></div>' +
        '<div class="ui-block-b"><div class="ui-bar ui-bar-a">Widgets ID:</div></div>' +
        '<div class="ui-block-c"><div class="ui-bar ui-bar-a">Widget Cost:</div></div>' +
        '<div class="ui-block-d"></div>' +
        '<div class="ui-block-e"><div class="ui-bar ui-bar-a">Total:</div></div>' +
        '</div>'
    );

    AppendLine(quantity, widgetID, widgetPrice, lineTotal);

    // $("#orderViewItems").append('<p>' + quantity + 
    //                         " of " + 
    //                         "Wiget ID: " + 
    //                         this.widgetID + 
    //                         " @ " +  
    //                         this.widgetPrice + 
    //                         "GDP" + 
    //                         " = " + 
    //                         this.lineTotal + 
    //                         "GDP" + 
    //                         '</p>');

}

/*
 * Helper method to append a single line to id = orderViewItems.
 */
function AppendLine(quantity, widgetID, widgetPrice, lineTotal) {
    // Append line
    $("#orderViewItems").append(
        '<div class="ui-grid-d" style="font-size:8px">' +
        '<div class="ui-block-a"><div class="ui-bar ui-bar-a">' + quantity + '</div></div>' +
        '<div class="ui-block-b"><div class="ui-bar ui-bar-a">' + widgetID + '</div></div>' +
        '<div class="ui-block-c"><div class="ui-bar ui-bar-a">' + widgetPrice + '</div></div>' +
        '<div class="ui-block-d"></div>' +
        '<div class="ui-block-e"><div class="ui-bar ui-bar-a">' + lineTotal + '</div></div>' +
        '</div>'
    );
}