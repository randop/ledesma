---
layout: post
title:  "PHP Debugging Utility using Monolog"
date: 2018-12-19T10:00:00+08:00
categories: php debug debugging programming
---
Have created a debug helper script which is very useful for tracing issues in PHP.

#### Requirements:
+ Composer
+ Monolog
+ localheinz/json-printer

#### Installation:
```
composer require monolog/monolog localheinz/json-printer
```

#### Script
```php
<?php
use Monolog\Logger;
use Monolog\ErrorHandler;
use Monolog\Formatter\CustomLineFormatter;
use Monolog\Handler\StreamHandler;
use Monolog\Processor\IntrospectionProcessor;
use Localheinz\Json\Printer\Printer;
//set this to desired log directory
$logdir = "";
$traceprinter = new Printer();
$traceformatter = new Monolog\Formatter\CustomLineFormatter(
    null,
    null,
    true,
    true
);
// create a log channel
$monolog = new Logger('randolph');
ErrorHandler::register($monolog);
$monolog->pushProcessor(new IntrospectionProcessor());
$debugstream = new StreamHandler($logdir. '/debug.log', Logger::DEBUG);
$debugstream->setFormatter($traceformatter);
$monolog->pushHandler($debugstream);
// create a trace log channel
$tracelog = new Logger('randolph');
//$tracelog->pushProcessor(new IntrospectionProcessor());
$tracestream = new StreamHandler($logdir . '/trace.log', Logger::DEBUG);
$tracestream->setFormatter($traceformatter);
$tracelog->pushHandler($tracestream);
function dtrace($msg='') {
    global $tracelog, $traceprinter;
    $backtrace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 1);
    $context = [
        'debug_backtrace' => $backtrace[0]
    ];
    if ( is_string($msg) || is_integer($msg) || is_bool($msg) ) {
        $tracelog->debug($msg);
    } elseif ( is_object($msg) || is_array($msg) ) {
        $tracelog->debug( $traceprinter->pprint(json_encode($msg), '  '), $context );
    } else {
        $tracelog->debug( var_export($msg, true) );
    }
    return true;
}
```