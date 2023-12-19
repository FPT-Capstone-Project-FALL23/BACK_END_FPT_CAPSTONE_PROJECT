const htmlMailActiveEvent = (organizer, event) => {
    return (`
    <html>
    
    <head>
        <meta name="viewport" content="width=device-width">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Your ticket</title>
        <style media="all" type="text/css">
            @media only screen and (max-width: 620px) {
    
                .span-2,
                .span-3 {
                    max-width: none !important;
                    width: 100% !important;
                }
    
                .span-2>table,
                .span-3>table {
                    max-width: 100% !important;
                    width: 100% !important;
                }
            }
    
            @media all {
                .btn-primary table td:hover {
                    background-color: #34495e !important;
                }
    
                .btn-primary a:hover {
                    background-color: #34495e !important;
                    border-color: #34495e !important;
                }
            }
    
            @media all {
                .btn-secondary a:hover {
                    border-color: #34495e !important;
                    color: #34495e !important;
                }
            }
    
            @media only screen and (max-width: 620px) {
                h1 {
                    font-size: 28px !important;
                    margin-bottom: 10px !important;
                }
    
                h2 {
                    font-size: 22px !important;
                    margin-bottom: 10px !important;
                }
    
                h3 {
                    font-size: 16px !important;
                    margin-bottom: 10px !important;
                }
    
                p,
                ul,
                ol,
                td,
                span,
                a {
                    font-size: 16px !important;
                }
    
                .wrapper,
                .article {
                    padding: 10px !important;
                }
    
                .content {
                    padding: 0 !important;
                }
    
                .container {
                    padding: 0 !important;
                    width: 100% !important;
                }
    
                .header {
                    margin-bottom: 10px !important;
                }
    
                .main {
                    border-left-width: 0 !important;
                    border-radius: 0 !important;
                    border-right-width: 0 !important;
                }
    
                .btn table {
                    width: 100% !important;
                }
    
                .btn a {
                    width: 100% !important;
                }
    
                .img-responsive {
                    height: auto !important;
                    max-width: 100% !important;
                    width: auto !important;
                }
    
                .alert td {
                    border-radius: 0 !important;
                    padding: 10px !important;
                }
    
                .receipt {
                    width: 100% !important;
                }
            }
    
            @media all {
                .ExternalClass {
                    width: 100%;
                }
    
                .ExternalClass,
                .ExternalClass p,
                .ExternalClass span,
                .ExternalClass font,
                .ExternalClass td,
                .ExternalClass div {
                    line-height: 100%;
                }
    
                .apple-link a {
                    color: inherit !important;
                    font-family: inherit !important;
                    font-size: inherit !important;
                    font-weight: inherit !important;
                    line-height: inherit !important;
                    text-decoration: none !important;
                }
            }
        </style>
    </head>
    
    <body
        style="font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; background-color: #f6f6f6; margin: 0; padding: 0;">
        <table bgcolor="#f6f6f6" border="0" cellpadding="0" cellspacing="0" class="body"
            style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background-color: #f6f6f6;"
            width="100%">
            <tbody>
                <tr>
                    <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
                    <td class="container"
                        style="font-family: sans-serif; font-size: 14px; vertical-align: top; Margin: 0 auto !important; max-width: 580px; padding: 10px; width: 580px;"
                        valign="top" width="580">
                        <div class="content"
                            style="box-sizing: border-box; display: block; Margin: 0 auto; max-width: 580px; padding: 10px;">
                            <!-- START CENTERED WHITE CONTAINER -->
    
                            <table class="main"
                                style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background: #fff; border-radius: 3px;"
                                width="100%"><!-- START MAIN CONTENT AREA -->
                                <tbody>
                                    <tr>
                                        <td class="wrapper"
                                            style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;"
                                            valign="top">
                                            <table border="0" cellpadding="0" cellspacing="0"
                                                style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;"
                                                width="100%">
                                                <tbody>
                                                    <tr>
                                                        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;"
                                                            valign="top">
                                                            <h1
                                                                style="color: #ff5722; font-family: sans-serif; font-weight: 300; line-height: 1.4; margin: 0; Margin-bottom: 15px; font-size: 25px; text-align: center;">
                                                                Hello ${organizer.organizer_name},</h1>
    
                                                            <h1
                                                                style="color: #222222; font-family: sans-serif; font-weight: 300; line-height: 1.4; margin: 0; Margin-bottom: 30px; font-size: 20px; text-align: center; ">
                                                                YOUR EVENT HAS BEEN ACTIVATED</h1>
    
                                                            <p><span style="color: #993300"><span
                                                                        style="background-color: #ffffff">Congratulations, you have successfully created the event ${event.event_name}.</span></span>
                                                            </p>
                                                            <p><span style="color: #993300"><span
                                                                        style="background-color: #ffffff">Your event is an opportunity to create beautiful memories and connect the community. Start preparing well for your event now!</span></span>
                                                            </p>
                                                            &nbsp;
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                    <!-- END MAIN CONTENT AREA -->
                                </tbody>
                            </table>
                            <!-- START FOOTER -->
    
                            <div class="footer" style="clear: both; padding-top: 10px; text-align: center; width: 100%;">
                                <table border="0" cellpadding="0" cellspacing="0"
                                    style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;"
                                    width="100%">
                                    <tbody>
                                        <tr>
                                            <td align="center" class="content-block powered-by"
                                                style="font-family: sans-serif; vertical-align: top; padding-top: 10px; padding-bottom: 10px; font-size: 12px; text-align: center;"
                                                valign="top">Powered by <a href="#"
                                                    style="font-size: 12px; text-align: center; text-decoration: none;">TikSeat</a>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <!-- END FOOTER --><!-- END CENTERED WHITE CONTAINER -->
                        </div>
                    </td>
                    <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
                </tr>
            </tbody>
        </table>
    </body>
    
    </html>
    `)
}

const htmlMailRejectEvent = (organizer, event) => {
    return (`
    <html>
    
    <head>
        <meta name="viewport" content="width=device-width">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Your ticket</title>
        <style media="all" type="text/css">
            @media only screen and (max-width: 620px) {
    
                .span-2,
                .span-3 {
                    max-width: none !important;
                    width: 100% !important;
                }
    
                .span-2>table,
                .span-3>table {
                    max-width: 100% !important;
                    width: 100% !important;
                }
            }
    
            @media all {
                .btn-primary table td:hover {
                    background-color: #34495e !important;
                }
    
                .btn-primary a:hover {
                    background-color: #34495e !important;
                    border-color: #34495e !important;
                }
            }
    
            @media all {
                .btn-secondary a:hover {
                    border-color: #34495e !important;
                    color: #34495e !important;
                }
            }
    
            @media only screen and (max-width: 620px) {
                h1 {
                    font-size: 28px !important;
                    margin-bottom: 10px !important;
                }
    
                h2 {
                    font-size: 22px !important;
                    margin-bottom: 10px !important;
                }
    
                h3 {
                    font-size: 16px !important;
                    margin-bottom: 10px !important;
                }
    
                p,
                ul,
                ol,
                td,
                span,
                a {
                    font-size: 16px !important;
                }
    
                .wrapper,
                .article {
                    padding: 10px !important;
                }
    
                .content {
                    padding: 0 !important;
                }
    
                .container {
                    padding: 0 !important;
                    width: 100% !important;
                }
    
                .header {
                    margin-bottom: 10px !important;
                }
    
                .main {
                    border-left-width: 0 !important;
                    border-radius: 0 !important;
                    border-right-width: 0 !important;
                }
    
                .btn table {
                    width: 100% !important;
                }
    
                .btn a {
                    width: 100% !important;
                }
    
                .img-responsive {
                    height: auto !important;
                    max-width: 100% !important;
                    width: auto !important;
                }
    
                .alert td {
                    border-radius: 0 !important;
                    padding: 10px !important;
                }
    
                .receipt {
                    width: 100% !important;
                }
            }
    
            @media all {
                .ExternalClass {
                    width: 100%;
                }
    
                .ExternalClass,
                .ExternalClass p,
                .ExternalClass span,
                .ExternalClass font,
                .ExternalClass td,
                .ExternalClass div {
                    line-height: 100%;
                }
    
                .apple-link a {
                    color: inherit !important;
                    font-family: inherit !important;
                    font-size: inherit !important;
                    font-weight: inherit !important;
                    line-height: inherit !important;
                    text-decoration: none !important;
                }
            }
        </style>
    </head>
    
    <body
        style="font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; background-color: #f6f6f6; margin: 0; padding: 0;">
        <table bgcolor="#f6f6f6" border="0" cellpadding="0" cellspacing="0" class="body"
            style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background-color: #f6f6f6;"
            width="100%">
            <tbody>
                <tr>
                    <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
                    <td class="container"
                        style="font-family: sans-serif; font-size: 14px; vertical-align: top; Margin: 0 auto !important; max-width: 580px; padding: 10px; width: 580px;"
                        valign="top" width="580">
                        <div class="content"
                            style="box-sizing: border-box; display: block; Margin: 0 auto; max-width: 580px; padding: 10px;">
                            <!-- START CENTERED WHITE CONTAINER -->
    
                            <table class="main"
                                style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background: #fff; border-radius: 3px;"
                                width="100%"><!-- START MAIN CONTENT AREA -->
                                <tbody>
                                    <tr>
                                        <td class="wrapper"
                                            style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;"
                                            valign="top">
                                            <table border="0" cellpadding="0" cellspacing="0"
                                                style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;"
                                                width="100%">
                                                <tbody>
                                                    <tr>
                                                        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;"
                                                            valign="top">
                                                            <h1
                                                                style="color: #ff5722; font-family: sans-serif; font-weight: 300; line-height: 1.4; margin: 0; Margin-bottom: 15px; font-size: 25px; text-align: center;">
                                                                Hello ${organizer.organizer_name},</h1>
    
                                                            <h1
                                                                style="color: #222222; font-family: sans-serif; font-weight: 300; line-height: 1.4; margin: 0; Margin-bottom: 30px; font-size: 20px; text-align: center; ">
                                                                YOUR EVENT HAS BEEN REJECTED</h1>
    
                                                            <p><span style="color: #993300"><span
                                                                        style="background-color: #ffffff">For some reason your ${event.event_name} event has been rejected..</span></span>
                                                            </p>
                                                            <p><span style="color: #993300"><span
                                                                        style="background-color: #ffffff">Please enter all required system information to create your complete event. If you have any questions, please reply to this email!</span></span>
                                                            </p>
                                                            &nbsp;
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                    <!-- END MAIN CONTENT AREA -->
                                </tbody>
                            </table>
                            <!-- START FOOTER -->
    
                            <div class="footer" style="clear: both; padding-top: 10px; text-align: center; width: 100%;">
                                <table border="0" cellpadding="0" cellspacing="0"
                                    style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;"
                                    width="100%">
                                    <tbody>
                                        <tr>
                                            <td align="center" class="content-block powered-by"
                                                style="font-family: sans-serif; vertical-align: top; padding-top: 10px; padding-bottom: 10px; font-size: 12px; text-align: center;"
                                                valign="top">Powered by <a href="#"
                                                    style="font-size: 12px; text-align: center; text-decoration: none;">TikSeat</a>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <!-- END FOOTER --><!-- END CENTERED WHITE CONTAINER -->
                        </div>
                    </td>
                    <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
                </tr>
            </tbody>
        </table>
    </body>
    
    </html>
    `)
}

const htmlMailActiveOrganizer = (organizer) => {
    return (`
    <html>
    
    <head>
        <meta name="viewport" content="width=device-width">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Your ticket</title>
        <style media="all" type="text/css">
            @media only screen and (max-width: 620px) {
    
                .span-2,
                .span-3 {
                    max-width: none !important;
                    width: 100% !important;
                }
    
                .span-2>table,
                .span-3>table {
                    max-width: 100% !important;
                    width: 100% !important;
                }
            }
    
            @media all {
                .btn-primary table td:hover {
                    background-color: #34495e !important;
                }
    
                .btn-primary a:hover {
                    background-color: #34495e !important;
                    border-color: #34495e !important;
                }
            }
    
            @media all {
                .btn-secondary a:hover {
                    border-color: #34495e !important;
                    color: #34495e !important;
                }
            }
    
            @media only screen and (max-width: 620px) {
                h1 {
                    font-size: 28px !important;
                    margin-bottom: 10px !important;
                }
    
                h2 {
                    font-size: 22px !important;
                    margin-bottom: 10px !important;
                }
    
                h3 {
                    font-size: 16px !important;
                    margin-bottom: 10px !important;
                }
    
                p,
                ul,
                ol,
                td,
                span,
                a {
                    font-size: 16px !important;
                }
    
                .wrapper,
                .article {
                    padding: 10px !important;
                }
    
                .content {
                    padding: 0 !important;
                }
    
                .container {
                    padding: 0 !important;
                    width: 100% !important;
                }
    
                .header {
                    margin-bottom: 10px !important;
                }
    
                .main {
                    border-left-width: 0 !important;
                    border-radius: 0 !important;
                    border-right-width: 0 !important;
                }
    
                .btn table {
                    width: 100% !important;
                }
    
                .btn a {
                    width: 100% !important;
                }
    
                .img-responsive {
                    height: auto !important;
                    max-width: 100% !important;
                    width: auto !important;
                }
    
                .alert td {
                    border-radius: 0 !important;
                    padding: 10px !important;
                }
    
                .receipt {
                    width: 100% !important;
                }
            }
    
            @media all {
                .ExternalClass {
                    width: 100%;
                }
    
                .ExternalClass,
                .ExternalClass p,
                .ExternalClass span,
                .ExternalClass font,
                .ExternalClass td,
                .ExternalClass div {
                    line-height: 100%;
                }
    
                .apple-link a {
                    color: inherit !important;
                    font-family: inherit !important;
                    font-size: inherit !important;
                    font-weight: inherit !important;
                    line-height: inherit !important;
                    text-decoration: none !important;
                }
            }
        </style>
    </head>
    
    <body
        style="font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; background-color: #f6f6f6; margin: 0; padding: 0;">
        <table bgcolor="#f6f6f6" border="0" cellpadding="0" cellspacing="0" class="body"
            style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background-color: #f6f6f6;"
            width="100%">
            <tbody>
                <tr>
                    <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
                    <td class="container"
                        style="font-family: sans-serif; font-size: 14px; vertical-align: top; Margin: 0 auto !important; max-width: 580px; padding: 10px; width: 580px;"
                        valign="top" width="580">
                        <div class="content"
                            style="box-sizing: border-box; display: block; Margin: 0 auto; max-width: 580px; padding: 10px;">
                            <!-- START CENTERED WHITE CONTAINER -->
    
                            <table class="main"
                                style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background: #fff; border-radius: 3px;"
                                width="100%"><!-- START MAIN CONTENT AREA -->
                                <tbody>
                                    <tr>
                                        <td class="wrapper"
                                            style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;"
                                            valign="top">
                                            <table border="0" cellpadding="0" cellspacing="0"
                                                style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;"
                                                width="100%">
                                                <tbody>
                                                    <tr>
                                                        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;"
                                                            valign="top">
                                                            <h1
                                                                style="color: #ff5722; font-family: sans-serif; font-weight: 300; line-height: 1.4; margin: 0; Margin-bottom: 15px; font-size: 25px; text-align: center;">
                                                                Hello ${organizer.organizer_name}</h1>
                                                            <p><span style="color: #993300"><span
                                                                        style="background-color: #ffffff">Your account has been activated.</span></span>
                                                            </p>
                                                            <p><span style="color: #993300"><span
                                                                        style="background-color: #ffffff">Now, log in and start your journey with us, creating amazing events!</span></span>
                                                            </p>
                                                            &nbsp;
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                    <!-- END MAIN CONTENT AREA -->
                                </tbody>
                            </table>
                            <!-- START FOOTER -->
    
                            <div class="footer" style="clear: both; padding-top: 10px; text-align: center; width: 100%;">
                                <table border="0" cellpadding="0" cellspacing="0"
                                    style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;"
                                    width="100%">
                                    <tbody>
                                        <tr>
                                            <td align="center" class="content-block powered-by"
                                                style="font-family: sans-serif; vertical-align: top; padding-top: 10px; padding-bottom: 10px; font-size: 12px; text-align: center;"
                                                valign="top">Powered by <a href="#"
                                                    style="font-size: 12px; text-align: center; text-decoration: none;">TikSeat</a>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <!-- END FOOTER --><!-- END CENTERED WHITE CONTAINER -->
                        </div>
                    </td>
                    <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
                </tr>
            </tbody>
        </table>
    </body>
    
    </html>
    `)
}

const htmlMailRejectOrganizer = (organizer) => {
    return (`
    <html>
    
    <head>
        <meta name="viewport" content="width=device-width">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Your ticket</title>
        <style media="all" type="text/css">
            @media only screen and (max-width: 620px) {
    
                .span-2,
                .span-3 {
                    max-width: none !important;
                    width: 100% !important;
                }
    
                .span-2>table,
                .span-3>table {
                    max-width: 100% !important;
                    width: 100% !important;
                }
            }
    
            @media all {
                .btn-primary table td:hover {
                    background-color: #34495e !important;
                }
    
                .btn-primary a:hover {
                    background-color: #34495e !important;
                    border-color: #34495e !important;
                }
            }
    
            @media all {
                .btn-secondary a:hover {
                    border-color: #34495e !important;
                    color: #34495e !important;
                }
            }
    
            @media only screen and (max-width: 620px) {
                h1 {
                    font-size: 28px !important;
                    margin-bottom: 10px !important;
                }
    
                h2 {
                    font-size: 22px !important;
                    margin-bottom: 10px !important;
                }
    
                h3 {
                    font-size: 16px !important;
                    margin-bottom: 10px !important;
                }
    
                p,
                ul,
                ol,
                td,
                span,
                a {
                    font-size: 16px !important;
                }
    
                .wrapper,
                .article {
                    padding: 10px !important;
                }
    
                .content {
                    padding: 0 !important;
                }
    
                .container {
                    padding: 0 !important;
                    width: 100% !important;
                }
    
                .header {
                    margin-bottom: 10px !important;
                }
    
                .main {
                    border-left-width: 0 !important;
                    border-radius: 0 !important;
                    border-right-width: 0 !important;
                }
    
                .btn table {
                    width: 100% !important;
                }
    
                .btn a {
                    width: 100% !important;
                }
    
                .img-responsive {
                    height: auto !important;
                    max-width: 100% !important;
                    width: auto !important;
                }
    
                .alert td {
                    border-radius: 0 !important;
                    padding: 10px !important;
                }
    
                .receipt {
                    width: 100% !important;
                }
            }
    
            @media all {
                .ExternalClass {
                    width: 100%;
                }
    
                .ExternalClass,
                .ExternalClass p,
                .ExternalClass span,
                .ExternalClass font,
                .ExternalClass td,
                .ExternalClass div {
                    line-height: 100%;
                }
    
                .apple-link a {
                    color: inherit !important;
                    font-family: inherit !important;
                    font-size: inherit !important;
                    font-weight: inherit !important;
                    line-height: inherit !important;
                    text-decoration: none !important;
                }
            }
        </style>
    </head>
    
    <body
        style="font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; background-color: #f6f6f6; margin: 0; padding: 0;">
        <table bgcolor="#f6f6f6" border="0" cellpadding="0" cellspacing="0" class="body"
            style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background-color: #f6f6f6;"
            width="100%">
            <tbody>
                <tr>
                    <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
                    <td class="container"
                        style="font-family: sans-serif; font-size: 14px; vertical-align: top; Margin: 0 auto !important; max-width: 580px; padding: 10px; width: 580px;"
                        valign="top" width="580">
                        <div class="content"
                            style="box-sizing: border-box; display: block; Margin: 0 auto; max-width: 580px; padding: 10px;">
                            <!-- START CENTERED WHITE CONTAINER -->
    
                            <table class="main"
                                style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background: #fff; border-radius: 3px;"
                                width="100%"><!-- START MAIN CONTENT AREA -->
                                <tbody>
                                    <tr>
                                        <td class="wrapper"
                                            style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;"
                                            valign="top">
                                            <table border="0" cellpadding="0" cellspacing="0"
                                                style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;"
                                                width="100%">
                                                <tbody>
                                                    <tr>
                                                        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;"
                                                            valign="top">
                                                            <h1
                                                                style="color: #ff5722; font-family: sans-serif; font-weight: 300; line-height: 1.4; margin: 0; Margin-bottom: 15px; font-size: 25px; text-align: center;">
                                                                Hello ${organizer.organizer_name}</h1>
                                                            <p><span style="color: #993300"><span
                                                                        style="background-color: #ffffff">Your account has been declined.</span></span>
                                                            </p>
                                                            <p><span style="color: #993300"><span
                                                                        style="background-color: #ffffff">If there are any problems, please respond to this email!</span></span>
                                                            </p>
                                                            &nbsp;
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                    <!-- END MAIN CONTENT AREA -->
                                </tbody>
                            </table>
                            <!-- START FOOTER -->
    
                            <div class="footer" style="clear: both; padding-top: 10px; text-align: center; width: 100%;">
                                <table border="0" cellpadding="0" cellspacing="0"
                                    style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;"
                                    width="100%">
                                    <tbody>
                                        <tr>
                                            <td align="center" class="content-block powered-by"
                                                style="font-family: sans-serif; vertical-align: top; padding-top: 10px; padding-bottom: 10px; font-size: 12px; text-align: center;"
                                                valign="top">Powered by <a href="#"
                                                    style="font-size: 12px; text-align: center; text-decoration: none;">TikSeat</a>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <!-- END FOOTER --><!-- END CENTERED WHITE CONTAINER -->
                        </div>
                    </td>
                    <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
                </tr>
            </tbody>
        </table>
    </body>
    
    </html>
    `)
}

const htmlOTP = (otp) => {
    return (`
    <p>Mã xác minh tài khoản Tikseat của bạn là:</p>
    <p style="color:tomato;font-size:25px;letter-spacing:2px;">
    <b>${otp}</b>
    </p>
    <p>Có hiệu lực trong <b>3 phút.</b>.KHÔNG chia sẻ mã này với người khác</p>
    `)
}

const htmlTicket = (event, foundEventArea, foundChair, founDayEvent, timeEvent, qrImageData) => {
    return (`<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Concert Ticket</title>
    </head>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            background-color: #f0f0f0;
            margin: 0;
            padding: 0;
        }
    
        .ticket {
            width: 600px;
            background-color: white;
            margin: 20px auto;
            border: 1px solid #ccc;
            border-radius: 5px;
        }
    
        .header {
            background-color: #c6c647;
            color: white;
            padding: 10px;
        }
    
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
    
        .content {
            text-align: left;
            padding: 20px;
        }
    
        .qr-code {
            margin: 20px 0;
        }
    
        img {
            height: 300px;
            width: 300px;
        }
    </style>
    
    <body>
        <div class="ticket">
            <div class="header">
                <h1>TikSeat</h1>
            </div>
            <div class="content">
                <P>Event Name: ${event.event_name}</p>
                <p>Date: ${founDayEvent}</p>
                <p>Time: ${timeEvent}</p>
                <p>Location: ${event.event_location.specific_address} - ${event.event_location.ward} -
                    ${event.event_location.district} - ${event.event_location.city}</p>
                <p>Class Ticket: <span style="font-size: 20px; font-weight: 600;">${foundEventArea}</span></p>
                <p>Seat: <span style="font-size: 20px; font-weight: 600;">${foundChair.chair_name}</span></p>
            </div>
            <div class="qr-code">
                <img src="${qrImageData}" alt="QR Code">
            </div>
            <h3 style="color: red;">Attention</h3>
            <div style="display: flex; align-items: start; flex-direction: column; padding-left: 20px;">
                <p>1. Give the QR code to the staff to scan the code to check in to the event</p>
                <p>2. Tickets can be refunded 24 hours before the end of the ticket sale date.</p>
                <p>3. Tickets are only valid for one-time use</p>
                <p>4. Do not share tickets with anyone</p>
            </div>
        </div>
    </body>
    
    </html>`)
}

const htmlsendTicketByEmail = (client) => {
    return (`<html>
        
    <head>
        <meta name="viewport" content="width=device-width">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Your ticket</title>
        <style media="all" type="text/css">
            @media only screen and (max-width: 620px) {
    
                .span-2,
                .span-3 {
                    max-width: none !important;
                    width: 100% !important;
                }
    
                .span-2>table,
                .span-3>table {
                    max-width: 100% !important;
                    width: 100% !important;
                }
            }
    
            @media all {
                .btn-primary table td:hover {
                    background-color: #34495e !important;
                }
    
                .btn-primary a:hover {
                    background-color: #34495e !important;
                    border-color: #34495e !important;
                }
            }
    
            @media all {
                .btn-secondary a:hover {
                    border-color: #34495e !important;
                    color: #34495e !important;
                }
            }
    
            @media only screen and (max-width: 620px) {
                h1 {
                    font-size: 28px !important;
                    margin-bottom: 10px !important;
                }
    
                h2 {
                    font-size: 22px !important;
                    margin-bottom: 10px !important;
                }
    
                h3 {
                    font-size: 16px !important;
                    margin-bottom: 10px !important;
                }
    
                p,
                ul,
                ol,
                td,
                span,
                a {
                    font-size: 16px !important;
                }
    
                .wrapper,
                .article {
                    padding: 10px !important;
                }
    
                .content {
                    padding: 0 !important;
                }
    
                .container {
                    padding: 0 !important;
                    width: 100% !important;
                }
    
                .header {
                    margin-bottom: 10px !important;
                }
    
                .main {
                    border-left-width: 0 !important;
                    border-radius: 0 !important;
                    border-right-width: 0 !important;
                }
    
                .btn table {
                    width: 100% !important;
                }
    
                .btn a {
                    width: 100% !important;
                }
    
                .img-responsive {
                    height: auto !important;
                    max-width: 100% !important;
                    width: auto !important;
                }
    
                .alert td {
                    border-radius: 0 !important;
                    padding: 10px !important;
                }
    
                .receipt {
                    width: 100% !important;
                }
            }
    
            @media all {
                .ExternalClass {
                    width: 100%;
                }
    
                .ExternalClass,
                .ExternalClass p,
                .ExternalClass span,
                .ExternalClass font,
                .ExternalClass td,
                .ExternalClass div {
                    line-height: 100%;
                }
    
                .apple-link a {
                    color: inherit !important;
                    font-family: inherit !important;
                    font-size: inherit !important;
                    font-weight: inherit !important;
                    line-height: inherit !important;
                    text-decoration: none !important;
                }
            }
        </style>
    </head>
    
    <body
        style="font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; background-color: #f6f6f6; margin: 0; padding: 0;">
        <table bgcolor="#f6f6f6" border="0" cellpadding="0" cellspacing="0" class="body"
            style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background-color: #f6f6f6;"
            width="100%">
            <tbody>
                <tr>
                    <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
                    <td class="container"
                        style="font-family: sans-serif; font-size: 14px; vertical-align: top; Margin: 0 auto !important; max-width: 580px; padding: 10px; width: 580px;"
                        valign="top" width="580">
                        <div class="content"
                            style="box-sizing: border-box; display: block; Margin: 0 auto; max-width: 580px; padding: 10px;">
                            <!-- START CENTERED WHITE CONTAINER -->
    
                            <table class="main"
                                style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background: #fff; border-radius: 3px;"
                                width="100%"><!-- START MAIN CONTENT AREA -->
                                <tbody>
                                    <tr>
                                        <td class="wrapper"
                                            style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;"
                                            valign="top">
                                            <table border="0" cellpadding="0" cellspacing="0"
                                                style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;"
                                                width="100%">
                                                <tbody>
                                                    <tr>
                                                        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;"
                                                            valign="top">
                                                            <h1
                                                                style="color: #ff5722; font-family: sans-serif; font-weight: 300; line-height: 1.4; margin: 0; Margin-bottom: 15px; font-size: 25px; text-align: center;">
                                                                Chào ${client.full_name},</h1>
    
                                                            <h1
                                                                style="color: #222222; font-family: sans-serif; font-weight: 300; line-height: 1.4; margin: 0; Margin-bottom: 30px; font-size: 20px; text-align: center; ">
                                                                BẠN ĐÃ MUA VÉ THÀNH CÔNG</h1>
    
                                                            <p><span style="color: #993300"><span
                                                                        style="background-color: #ffffff">Chúc mừng bạn đã mua vé thành công! Vui lòng chuẩn bị sẵn vé tại nơi soát vé. </span></span>
                                                            </p>
                                                            <p><span style="color: #993300"><span
                                                                        style="background-color: #ffffff">Vé sẽ được đính kèm trong email này</span></span>
                                                            </p>
                                                            &nbsp;
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                    <!-- END MAIN CONTENT AREA -->
                                </tbody>
                            </table>
                            <!-- START FOOTER -->
    
                            <div class="footer" style="clear: both; padding-top: 10px; text-align: center; width: 100%;">
                                <table border="0" cellpadding="0" cellspacing="0"
                                    style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;"
                                    width="100%">
                                    <tbody>
                                        <tr>
                                            <td align="center" class="content-block powered-by"
                                                style="font-family: sans-serif; vertical-align: top; padding-top: 10px; padding-bottom: 10px; font-size: 12px; text-align: center;"
                                                valign="top">Powered by <a href="#"
                                                    style="font-size: 12px; text-align: center; text-decoration: none;">TikSeat</a>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <!-- END FOOTER --><!-- END CENTERED WHITE CONTAINER -->
                        </div>
                    </td>
                    <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
                </tr>
            </tbody>
        </table>
    </body>
    
    </html>`)
}

module.exports = { htmlMailActiveEvent, htmlMailRejectEvent, htmlMailActiveOrganizer, htmlMailRejectOrganizer, 
htmlOTP, htmlTicket, htmlsendTicketByEmail }