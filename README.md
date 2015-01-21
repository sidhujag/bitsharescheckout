bitshares/bitsharescheckout
=======================
# About
	
+ Bitshares payments gateway for E-Commerce applications. Imagine using accepting payments for orders in any fiat currency on the blockchain! You have a business and you don't want to add a custom currency such as Bitcoin or BTS? Easily integrate Bitshares Checkout using one of the well-known shopping carts and accept payments for the BitAsset equivalent of the fiat currency using the Bitshares decentralized exchange within minutes! Choose a plugin available for one of the many popular shopping-cart packages to be able to pay for orders using the BitXXX equivalent of fiat currency used to create order
  in the shopping cart website. For example, someone checks out with USD currency selected, Bitshares Checkout will automatically create an invoice to pay for the order via BitUSD and once
  payment is recieved on the blockchain the order is processed and a signal is sent to the plugin using Bitshares Checkout that a payment has been made. Can't find a plugin for you're shopping cart or custom web store? Create one by following the 7 easy steps below under back-end development. Hire a developer if you are not a coder, it is less than 4 hours work!

+ The front-end experience is consistent to any plugin leveraging this system, typically Bitshares Checkout is redirected to by the shopping cart and then it redirects the user back once a payment has been made or the order is cancelled by the user.
  
	
# System Requirements

+ A plugin developed to use Bitshares Checkout to allow payments of orders via the Bitshares decentralized exchange. For a list of plugins available see (http://github.com/sidhujag) or create your own. See below.
+ PHP 5+
+ PHP CURL extension (typically installed automatically)

# Installation

1. Copy these files into your application root directory. Typically the root of your shopping cart or E-Commerce application.
2. Copy the Bitshares plugin for your shopping cart software to the same root directory. Overwrite any files.

# Development/Debugging Front-End

1. From the checkout directory type 'npm install' and then 'grunt build <release|debug>' depending on if you want to make a debug or release build. The minified files will be copied to the root.
2. If creating a debug build you must change index.html to load the debug version of the JS/CSS files you build above.
	
# Development/Debugging Back-End

Each shopping cart plugin handles order processing differently and there are many examples of how this is done, take a look at userfunctions.php of each plugin (http://github.com/sidhujag). It is the only file you will need to touch.

There are only a few functions in userfunctions.php that a plugin is responsible for in order to work with Bitshares Checkout, the rest of the hardwork is done for you:

1. isOrderCompleteUser($memo, $order_id) -  Passed a MEMO and ORDER_ID, is responsible for asking the E-Commerce application (shopping cart) if an order has been 'completed' usually done by checking order status of an open order. The exact status depends on the application and how it stores status in its database. Returns TRUE or FALSE. Usually ORDER_ID is used here and corrosponds to the ORDER_ID of the order that the application passed to Bitshares Checkout. Memo of the returned order information from the application is recreated and confirmed as a sanity test against the MEMO field passed in.
2. doesOrderExistUser($memo, $order_id) - Passed a MEMO and ORDER_ID, is responsible for asking the E-Commerce application (shopping cart) if an order exists and is in 'unpaid' status. The exact status depends on the application and how it stores status in its database. usually done by checking order status of an open order. Returns the order or FALSE if not found. Usually ORDER_ID is used here and corrosponds to the ORDER_ID of the order that the application passed to Bitshares Checkout. Memo of the returned order information from the application is recreated and confirmed as a sanity test against the MEMO field passed in.
3. getOpenOrdersUser() - No parameters. Is responsible for asking the E-Commerce application (shopping cart) for any orders in 'unpaid' status. The exact status depends on the application and how it stores status in its database. Usually done by checking order status of an open order. Returns an array of orders or an empty array if no orders found. Used by the cronjob to update open order status of any order that has been paid.
4. completeOrderUser($order) - Order object passed in with all order fields filled in, including MEMO, ORDER_ID, TOTAL, ASSET (BitUSD, BitGBP etc). Is responsible for updating the E-Commerce application for an order that has been paid. Called by Bitshares Checkout once a payment has been discovered in the wallet running locally to Bitshares Checkout. You must add any payments to the application and set status to 'paid'.	The exact status depends on the application and how it stores status in its database. Returns an object with URL parameter representing where the user should be redirected to. Typically a success page in the E-Commerce application.
5. cancelOrderUser($order) - Order object passed in with all order fields filled in, including MEMO, ORDER_ID, TOTAL, ASSET (BitUSD, BitGBP etc). Is responsible for updating the E-Commerce application for an order that has been cancelled. Called by Bitshares Checkout once a user clicks on the cancel link in Bitshares Checkout. You must set the status to 'cancelled' to the order in the E-Commerce application.	The exact status depends on the application and how it stores status in its database. Returns an object with URL parameter representing where the user should be redirected to. Typically a failed/cancelled page in the E-Commerce application.	
6. cronJobUser() - No parameters. Is responsible for any additional logic to be run after a cron job has executed. Typically used to cleanup old orders that haven't been paid for say 30 days. The normal CronJob logic is to scan the blockchain and call completeOrderUser() once a payment has been discovered through the cronjob. This happens for you by Bitshares Checkout. It will not follow the URL redirect link in this case.
7. createOrderUser() - 3 Parameters passed via $_REQUEST variables when redirect2bitshares.php is called to load Bitshares Checkout. Create a MEMO field from from order amount, asset and order id. These 3 variables are the only ones needed to be passed into Bitshares Checkout for it to do its thing.

# Configuration

1. Fill out the config.php of your plugin with appropriate information to configure Bitshares Checkout<br />
    a. $baseURL - should point to your web root directory of your E-Commerce application, including the forward slash at the end.
		- IE: $baseURL = 'http://www.bitsharesdemo.com/whmcs/';
	b. $accountName - The name of your Bitshares account to accept payments from people who pay via Bitshares Checkout. The wallet must be running on the same server thats serving Bitshares Checkout
	c. $rpcUser, $rpcPass, $rpcPort - RPC Credentials to connect to your Bitshares client accepting RPC connections. Make sure your RPC settings on your client match these settings. The client must be running on the same server as the one serving Bitshares Checkout.
	d. $demoMode - If set to TRUE, will accept any asset from Bitshares as a form of payment towards an order
		- IE: User checks out with a $3 USD order, Bitshares Checkout will accept 3 BTS for complete payment is set to TRUE, otherwise will only accept 3 BitUSD to complete payment. Important! for demo use only, set to FALSE for production environments.
	e. $hashSalt - Just a salt value used in calculating the hash value you see in the MEMO field, make it unique and un-guessable.
	f. $cronToken - A token used to validate cron job calls, similar to the salt just a unique value that is unique and un-guessable.
2. Make sure config.php/userfunctions.php are not accessible to any visitors. Important! For security reasons make sure these files are locked down and test to make sure they are not readable/writable by visitors. Any form of access should be prohibited symlinks, directory/file browsing etc. By default the htaccess file is already set up for you. If your webserver works with the htaccess file then your good to go!


Usage
-----
When a shopper chooses the Bitshares payment method using the plugin in the E-Commerce application, they will be redirected to Bitshares Checkout where they will pay an invoice.  Bitshares Checkout will then notify the plugin that the order was paid for.  The plugin will notify the E-Commerce application (shopping cart) that an order was fulfilled or cancelled. The customer will then be redirected back to the E-Commerce application.  


# Support

## Support

* [Github Issues](https://github.com/sidhujag/bitsharescheckout/issues)
  * Open an Issue if you are having issues with this plugin


# Contribute

To contribute to this project, please fork and submit a pull request.

# License

The MIT License (MIT)

Copyright (c) 2011-2015 Bitshares

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
