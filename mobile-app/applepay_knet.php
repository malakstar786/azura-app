<?php
namespace Opencart\Catalog\Controller\Extension\Opencart\Payment;

class ApplePayKnet extends \Opencart\System\Engine\Controller {

    public function index(): string {
        $this->load->language('extension/opencart/payment/applepay_knet');
        $data['merchant_id'] = $this->config->get('payment_applepay_knet_merchant_id');
        $this->load->model('checkout/order');
	    $order_info = $this->model_checkout_order->getOrder($this->session->data['order_id']);
        $data['total'] = round($order_info['total'],3);
        $data['order_id'] = $this->session->data['order_id'];
        return $this->load->view('extension/opencart/payment/applepay_knet', $data);
    }

    public function validateMerchant(): void {
        $this->response->addHeader('Content-Type: application/json');
        $input = json_decode(file_get_contents('php://input'), true);
        $json = [];

        if (!isset($input['validationURL'])) {
            $json['error'] = 'Missing validation URL';
        } else {
            $merchantIdentifier = $this->config->get('payment_applepay_knet_merchant_id');
            $domainName = $this->request->server['HTTP_HOST'];
            $displayName = $this->config->get('config_name');
            $certPath = DIR_STORAGE . 'applepay/merchant_identity.pem'; // must exist

            $payload = [
                'merchantIdentifier' => $merchantIdentifier,
                'domainName'         => $domainName,
                'displayName'        => $displayName
            ];

            $ch = curl_init($input['validationURL']);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSLCERT, $certPath);
            curl_setopt($ch, CURLOPT_SSLKEY, $certPath);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

            $response = curl_exec($ch);
             $this->log->write("ApplePay marchant response: " . $response);
            $json = $response ? json_decode($response, true) : ['error' => curl_error($ch)];
            curl_close($ch);
        }

        $this->response->setOutput(json_encode($json));
    }

public function processPayment(): void {
    $this->response->addHeader('Content-Type: application/json');
    $data = json_decode(file_get_contents('php://input'), true);

    // Track ID, amount, currency
    $trackId = $data['trackId'] ?? ($this->session->data['order_id'].'_' . time());
    $amount = number_format((float)($data['amount'] ?? 0), 3, '.', ''); // ✅ 3-decimal
    $currency = $data['currencyCode'] ?? '414'; // ✅ KWD

    // KNET credentials
    $merchantId = $this->config->get('payment_applepay_knet_knet_id');
    $password = $this->config->get('payment_applepay_knet_knet_password');

    // Callback URLs
    $responseURL = $this->url->link('extension/payment/applepay_knet_callback', '', true);
    $errorURL = $this->url->link('extension/payment/applepay_knet_callback', '', true);

    // Extract token fields
    $tokenData = $data['token']['paymentData'] ?? [];
    $paymentMethod = $data['token']['paymentMethod'] ?? [];

    // ✅ Ensure required fields are present
    if (empty($tokenData['data']) || empty($tokenData['header']['transactionId'])) {
        $this->response->setOutput(json_encode([
            'status' => 'error',
            'message' => 'Missing Apple Pay token or transactionId'
        ]));
        return;
    }

    // ✅ UDF8 = Apple Pay transactionId
    $udf8 = $tokenData['header']['transactionId'];

    // ✅ UDF9 = Full paymentData blob, as JSON
    $udf9 = json_encode($tokenData, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

    // ✅ UDF10 = paymentMethod metadata
    $udf10 = json_encode($paymentMethod, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

    // ✅ Build XML request with CDATA on udf9
    $xml = "<request>" .
           "<id>{$merchantId}</id>" .
           "<password>{$password}</password>" .
           "<action>1</action>" .
           "<currency>{$currency}</currency>" .
           "<langid>EN</langid>" .
           "<amt>{$amount}</amt>" .
           "<trackid>{$trackId}</trackid>" .
           "<udf8>{$udf8}</udf8>" .
           "<udf9><![CDATA[{$udf9}]]></udf9>" .
           "<udf10>{$udf10}</udf10>" .
           "<responseURL>{$responseURL}</responseURL>" .
           "<errorURL>{$errorURL}</errorURL>" .
           "</request>";

    // ✅ Log the payload
    $this->log->write("ApplePay KNET Request: " . $xml);

    // ✅ Send to KNET
    $ch = curl_init('https://www.kpay.com.kw/kpg/tranPipe.htm?param=tranInit&');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $xml);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/xml']);
    $response = curl_exec($ch);
    $error = curl_error($ch);
    curl_close($ch);

    // ✅ Log response
    $this->log->write("ApplePay KNET Response: " . $response);

    // ✅ Respond to client
    if ($error) {
        $this->response->setOutput(json_encode(['status' => 'failed', 'message' => $error]));
    } else {
        $response = "<response>$response</response>";

        // Convert XML to SimpleXMLElement
        $xml = simplexml_load_string($response);
        
        // Convert to associative array
        $data = json_decode(json_encode($xml), true);
         $this->load->model('checkout/order');
           //$order_id = str_replace('ORDER_', '', $data['trackid']);
            
            $trackid =$data['trackid'] ?? '';
            $result = $data['result'] ?? '';
            $paymentid = $data['payid'] ?? '';
        
            $ref = isset($data['ref']) ? $data['ref'] : '';
    		$tranid = isset($data['tranid']) ? $data['tranid'] : '';
    		$amount = isset($data['amt']) ? $data['amt'] : '';
    		$trx_error = isset($data['Error']) ? $data['Error'] : '';
    		$trx_errortext = isset($data['ErrorText']) ? $data['ErrorText'] : '';
    		$postdate = isset($data['postdate']) ? $data['postdate'] : '';
    		$auth = isset($data['auth']) ? $data['auth'] : '';
    		$udf1 = isset($data['udf1']) ? $data['udf1'] : '';
    		$udf2 = isset($data['udf2']) ? $data['udf2'] : '';
    		$udf3 = isset($data['udf3']) ? $data['udf3'] : '';
    		$udf4 = isset($data['udf4']) ? $data['udf4'] : '';
    		$udf5 = isset($data['udf5']) ? $data['udf5'] : '';
        if ($data['result'] === 'CAPTURED' && $data['authRespCode'] === '00') {
            // Update order as success
          
		    $this->db->query("insert into ".DB_PREFIX."knet_payment_details set order_id=".$this->session->data['order_id'].",result='".$result."',paymentID='".$paymentid."',trackid='".$trackid."',referenceNo='".$ref."',transactionID='".$tranid."',amount='".$amount."',errorNo='".$trx_error."',errorText='".$trx_errortext."',postDate='".$postdate."',auth='".$auth."',mode='applepay'");
            $this->model_checkout_order->addHistory($this->session->data['order_id'], 1, 'Apple Pay success');
           
            $this->session->data['apple_pay_paymentID'] = $paymentid;
            $this->session->data['apple_pay_referenceNo'] = $ref;
            $this->session->data['apple_pay_trackid'] = $trackid;
            $resultArray['redirect'] = $this->url->link('checkout/success', '', true);
            $resultArray['status'] = "success";
            } else {
                	$this->model_checkout_order->addHistory($this->session->data['order_id'], 10, ' Payment Failed! Check dashboard for details');
    				unset($this->session->data['order_id']);
    				unset($this->session->data['payment_address']);
    				unset($this->session->data['payment_method']);
    				unset($this->session->data['payment_methods']);
    				unset($this->session->data['shipping_address']);
    				unset($this->session->data['shipping_method']);
    				unset($this->session->data['shipping_methods']);
    				unset($this->session->data['comment']);
    				unset($this->session->data['coupon']);
    				unset($this->session->data['reward']);
    				unset($this->session->data['voucher']);
    				unset($this->session->data['vouchers']);
    				$this->session->data['error'] = ' Payment Failed! Check dashboard for details';
                    $resultArray['redirect'] = $this->url->link('checkout/cart', '', true);
                    $resultArray['status'] = "failed";
                    $resultArray['apple_pay_paymentID'] = $paymentid;
                    $resultArray['apple_pay_referenceNo'] = $ref;
                    $resultArray['apple_pay_trackid'] = $trackid;
                    $resultArray['amount'] = $amount;
                    $resultArray['date'] = date('Y-m-d H:i:s');
            }
       
        $this->response->setOutput(json_encode($resultArray));
    }
}

public function processPaymentApp(): void {
    $this->response->addHeader('Content-Type: application/json');
    $data = json_decode(file_get_contents('php://input'), true);

    // Track ID, amount, currency
    $s_orderId = $data['order_id'];
    $trackId = $data['trackId'] ?? ($data['order_id'].'_' . time());
    $amount = number_format((float)($data['amount'] ?? 0), 3, '.', ''); // ✅ 3-decimal
    $currency = $data['currencyCode'] ?? '414'; // ✅ KWD

    // KNET credentials
    $merchantId = $this->config->get('payment_applepay_knet_knet_id');
    $password = $this->config->get('payment_applepay_knet_knet_password');

    // Callback URLs
    $responseURL = $this->url->link('extension/payment/applepay_knet_callback', '', true);
    $errorURL = $this->url->link('extension/payment/applepay_knet_callback', '', true);

    // Extract token fields
    $tokenData = $data['token']['paymentData'] ?? [];
    $paymentMethod = $data['token']['paymentMethod'] ?? [];

    // ✅ Ensure required fields are present
    if (empty($tokenData['data']) || empty($tokenData['header']['transactionId'])) {
        $this->response->setOutput(json_encode([
            'status' => 'error',
            'message' => 'Missing Apple Pay token or transactionId'
        ]));
        return;
    }

    // ✅ UDF8 = Apple Pay transactionId
    $udf8 = $tokenData['header']['transactionId'];

    // ✅ UDF9 = Full paymentData blob, as JSON
    $udf9 = json_encode($tokenData, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

    // ✅ UDF10 = paymentMethod metadata
    $udf10 = json_encode($paymentMethod, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

    // ✅ Build XML request with CDATA on udf9
    $xml = "<request>" .
           "<id>{$merchantId}</id>" .
           "<password>{$password}</password>" .
           "<action>1</action>" .
           "<currency>{$currency}</currency>" .
           "<langid>EN</langid>" .
           "<amt>{$amount}</amt>" .
           "<trackid>{$trackId}</trackid>" .
           "<udf8>{$udf8}</udf8>" .
           "<udf9><![CDATA[{$udf9}]]></udf9>" .
           "<udf10>{$udf10}</udf10>" .
           "<responseURL>{$responseURL}</responseURL>" .
           "<errorURL>{$errorURL}</errorURL>" .
           "</request>";

    // ✅ Log the payload
    $this->log->write("ApplePay KNET Request: " . $xml);

    // ✅ Send to KNET
    $ch = curl_init('https://www.kpaytest.com.kw/kpg/tranPipe.htm?param=tranInit&');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $xml);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/xml']);
    $response = curl_exec($ch);
    $error = curl_error($ch);
    curl_close($ch);

    // ✅ Log response
    $this->log->write("ApplePay KNET Response: " . $response);

    // ✅ Respond to client
    if ($error) {
        $this->response->setOutput(json_encode(['status' => 'failed', 'message' => $error]));
    } else {
        $response = "<response>$response</response>";

        // Convert XML to SimpleXMLElement
        $xml = simplexml_load_string($response);
        
        // Convert to associative array
        $data = json_decode(json_encode($xml), true);
         $this->load->model('checkout/order');
           //$order_id = str_replace('ORDER_', '', $data['trackid']);
            
            $trackid =$data['trackid'] ?? '';
            $result = $data['result'] ?? '';
            $paymentid = $data['payid'] ?? '';
        
            $ref = isset($data['ref']) ? $data['ref'] : '';
    		$tranid = isset($data['tranid']) ? $data['tranid'] : '';
    		$amount = isset($data['amt']) ? $data['amt'] : '';
    		$trx_error = isset($data['Error']) ? $data['Error'] : '';
    		$trx_errortext = isset($data['ErrorText']) ? $data['ErrorText'] : '';
    		$postdate = isset($data['postdate']) ? $data['postdate'] : '';
    		$auth = isset($data['auth']) ? $data['auth'] : '';
    		$udf1 = isset($data['udf1']) ? $data['udf1'] : '';
    		$udf2 = isset($data['udf2']) ? $data['udf2'] : '';
    		$udf3 = isset($data['udf3']) ? $data['udf3'] : '';
    		$udf4 = isset($data['udf4']) ? $data['udf4'] : '';
    		$udf5 = isset($data['udf5']) ? $data['udf5'] : '';
        if ($data['result'] === 'CAPTURED' && $data['authRespCode'] === '00') {
            // Update order as success
          
		    $this->db->query("insert into ".DB_PREFIX."knet_payment_details set order_id=".$s_orderId.",result='".$result."',paymentID='".$paymentid."',trackid='".$trackid."',referenceNo='".$ref."',transactionID='".$tranid."',amount='".$amount."',errorNo='".$trx_error."',errorText='".$trx_errortext."',postDate='".$postdate."',auth='".$auth."',mode='applepay'");
            //$this->model_checkout_order->addHistory($s_orderId, 1, 'Apple Pay success');
           
            $this->session->data['apple_pay_paymentID'] = $paymentid;
            $this->session->data['apple_pay_referenceNo'] = $ref;
            $this->session->data['apple_pay_trackid'] = $trackid;
            $resultArray['redirect'] = $this->url->link('checkout/success', '', true);
            $resultArray['status'] = "success";
            } else {
                	//$this->model_checkout_order->addHistory($s_orderId, 10, ' Payment Failed! Check dashboard for details');
    				unset($this->session->data['order_id']);
    				unset($this->session->data['payment_address']);
    				unset($this->session->data['payment_method']);
    				unset($this->session->data['payment_methods']);
    				unset($this->session->data['shipping_address']);
    				unset($this->session->data['shipping_method']);
    				unset($this->session->data['shipping_methods']);
    				unset($this->session->data['comment']);
    				unset($this->session->data['coupon']);
    				unset($this->session->data['reward']);
    				unset($this->session->data['voucher']);
    				unset($this->session->data['vouchers']);
    				$this->session->data['error'] = ' Payment Failed! Check dashboard for details';
                    $resultArray['redirect'] = $this->url->link('checkout/cart', '', true);
                    $resultArray['status'] = "failed";
                    $resultArray['apple_pay_paymentID'] = $paymentid;
                    $resultArray['apple_pay_referenceNo'] = $ref;
                    $resultArray['apple_pay_trackid'] = $trackid;
                    $resultArray['amount'] = $amount;
                    $resultArray['date'] = date('Y-m-d H:i:s');
            }
       
        $this->response->setOutput(json_encode($resultArray));
    }
}

}
