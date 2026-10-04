# SAML

## Overview

Security Assertion Markup Language (SAML) is primarily used to implement the _Single Sign-On_ between one or multiple Service Provider_s_ and one IDentity Provider.

<figure><figcaption></figcaption></figure>

### Usage

{% tabs %}
{% tab title="User Agent" %}
A user agent, usually a web browser, requests resources protected by a SAML service provider.
{% endtab %}

{% tab title="Service Provider" %}
The service provider with redirect the user agent to the trust identity provider to authenticate the user.

#### SAMLResponse

After the successful authentication and getting the SAMLReponse from the identity provider, the user agent will submit SAMLResponse to the SP to log into the service.

#### Sign-In

The service provider validates the SAMLReponse with the certification of the _trust_ Identity provider.
{% endtab %}

{% tab title="Identity Provider" %}

{% endtab %}
{% endtabs %}

## Application

### Cloud

{% tabs %}
{% tab title="Google Cloud" %}
{% embed url="https://cloud.google.com/architecture/identity/single-sign-on#single_sign-on_process" %}
{% endtab %}

{% tab title="AWS IAM Identity Center" %}
{% embed url="https://aws.amazon.com/iam/identity-center/" %}
{% endtab %}

{% tab title="Azure" %}
{% embed url="https://learn.microsoft.com/en-us/azure/active-directory/manage-apps/what-is-single-sign-on" %}
{% endtab %}
{% endtabs %}

## Labs

* [PentesterLab: SAML: Introduction](https://pentesterlab.com/exercises/saml/course)
* [HackTheBox Academic: Attacking Authentication Mechanisms](https://academy.hackthebox.com/module/details/170)
