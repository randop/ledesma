---
layout: post
title:  "PHP Console Template"
date: 2018-05-24T10:00:00+08:00
categories: php debug console programming
---
A template to use when making a script that runs in command-line.

```php
<?php
ini_set('memory_limit', '256M');
function stdoutlog($msg)
{
    fwrite(STDOUT, date('Y-m-d G:i:s') . ' ');
    fwrite(STDOUT, $msg);
    fwrite(STDOUT, PHP_EOL);
}
function log_error( $num, $str, $file, $line, $context = null )
{
    log_exception( new ErrorException( $str, 0, $num, $file, $line ) );
}
function log_exception( Exception $e )
{
    $err = "Type: " . get_class( $e ) . "; Message: {$e->getMessage()}; File: {$e->getFile()}; Line: {$e->getLine()};";
    stdoutlog($err);
}
function check_for_fatal()
{
    $error = error_get_last();
    if ( $error["type"] == E_ERROR ) {
        log_error( $error["type"], $error["message"], $error["file"], $error["line"] );
    }
}
register_shutdown_function( "check_for_fatal" );
set_error_handler( "log_error" );
set_exception_handler( "log_exception" );
error_reporting(E_ALL & ~(E_STRICT|E_NOTICE|E_DEPRECATED|E_USER_DEPRECATED));
ini_set('error_reporting', E_ALL & ~(E_STRICT|E_NOTICE|E_DEPRECATED|E_USER_DEPRECATED));
chdir( realpath( __DIR__) );
```