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

module.exports = { htmlMailActiveEvent }