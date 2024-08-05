const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');
const fs = require('node:fs');
const path = require('node:path');
const getDateAndTime = require('../date/date_info');

// Configurar las fuentes
pdfMake.vfs = pdfFonts.pdfMake.vfs;

function getBase64Image(filePath) {
    const image = fs.readFileSync(path.resolve(__dirname, filePath));
    return `data:image/png;base64,${image.toString('base64')}`;
}

function setupFonts() {
    const fontFiles = [
        'Montserrat-Regular.ttf', 'Montserrat-Bold.ttf', 'Montserrat-Italic.ttf', 'Montserrat-BoldItalic.ttf'
    ];
    fontFiles.forEach(font => {
        const fontPath = path.resolve(__dirname, '../../assets/fonts', font); // Ajusta la ruta según sea necesario
        pdfMake.vfs[font] = fs.readFileSync(fontPath).toString('base64');
    });
}

setupFonts();

pdfMake.fonts = {
    Montserrat: {
        normal: 'Montserrat-Regular.ttf',
        bold: 'Montserrat-Bold.ttf',
        italics: 'Montserrat-Italic.ttf',
        bolditalics: 'Montserrat-BoldItalic.ttf'
    }
};

// Función para generar PDF
async function generatePDF(orders, franchise) {
    return new Promise(async (resolve, reject) => {
        const logoBase64 = getBase64Image('../../assets/logo.png'); 
        const { fecha, hora } = await getDateAndTime();

        const docDefinition = {
            content: [
                {
                    columns: [
                        { image: getBase64Image('../../assets/logo.png'), fit: [150, 150] },
                        { text: fecha, fontSize: 14, bold: true, margin: [0, 25, 0, 0], alignment: 'right' }
                    ]
                },
                { text: franchise.nombre, style: 'header', alignment: 'center' },
                ...orders.map(order => ({
                    stack: [
                        { text: 'Comanda de pedido', style: 'subheader' },
                        {
                            columns: [
                                {
                                    width: '70%',
                                    stack: [
                                        {
                                            text: [
                                                { text: 'Referencia: ', bold: true },
                                                { text: order.tipo_orden }
                                            ],
                                            margin: [0, 0, 0, 4]
                                        },
                                        order.tipo_orden === 'domicilio' ? {
                                            text: [
                                                { text: 'Cliente: ', bold: true },
                                                { text: order.nombre_cliente }
                                            ],
                                            margin: [0, 0, 0, 4]
                                        } : {
                                            text: [
                                                { text: 'Mesero: ', bold: true },
                                                { text: order.mesero }
                                            ],
                                            margin: [0, 0, 0, 4]
                                        },
                                        order.tipo_orden === 'domicilio' ? {
                                            text: [
                                                { text: 'Capturado por: ', bold: true },
                                                { text: order.mesero }
                                            ],
                                            margin: [0, 0, 0, 4]
                                        } : {
                                            text: [
                                                { text: 'Fecha: ', bold: true },
                                                { text: order.fecha_registro }
                                            ],
                                            margin: [0, 0, 0, 4]
                                        },
                                        {
                                            text: [
                                                { text: 'Estatus: ', bold: true },
                                                { text: order.estatus }
                                            ],
                                            margin: [0, 0, 0, 4]
                                        },
                                    ]
                                },
                                {
                                    width: '30%',
                                    stack: [
                                        {
                                            text: [
                                                { text: 'Folio: ', bold: true },
                                                { text: order.folio }
                                            ],
                                            margin: [0, 0, 0, 4]
                                        },
                                        order.tipo_orden === 'domicilio' ? {
                                            text: [
                                                { text: 'Fecha: ', bold: true },
                                                { text: order.fecha_registro }
                                            ],
                                            margin: [0, 0, 0, 4]
                                        } : {
                                            text: [
                                                { text: 'Mesa: ', bold: true },
                                                { text: order.mesa }
                                            ],
                                            margin: [0, 0, 0, 4]
                                        },
                                        {
                                            text: [
                                                { text: 'Hora: ', bold: true },
                                                { text: order.hora_registro }
                                            ],
                                            margin: [0, 0, 0, 4]
                                        }
                                    ]
                                },
                            ],
                            margin: [0, 0, 0, 10]
                        },
                        {
                            table: {
                                widths: ['10%', '20%', '50%', '20%'], // Adjusted widths for 4 columns
                                body: [
                                    [
                                        { text: 'Cantidad', style : 'tableHeader' },
                                        { text: 'Producto', style : 'tableHeader'},
                                        { text: 'Descripción', style : 'tableHeader'},
                                        { text: 'Subtotal', style : 'tableHeader' }
                                    ],
                                    ...order.productos.map(product => [
                                        { text: product.cantidad, alignment: 'center' },
                                        { text: product.nombre, alignment: 'justify' },
                                        { text: product.descripcion, alignment: 'justify' },
                                        { text: `$${product.subtotal}`, alignment: 'center' }
                                    ]),
                                    ...order.combos.map(combo => [
                                        { text: combo.cantidad, alignment: 'center' },
                                        { text: combo.nombre, alignment: 'justify' },
                                        { text: combo.descripcion, alignment: 'justify' },
                                        { text: `$${combo.subtotal}`, alignment: 'center' }
                                    ]),
                                    [{ text: 'Subtotal', colSpan: 3, alignment: 'left', bold: true }, {}, {}, { text: `\$${order.subtotal}`, alignment: 'center', bold: true }],
                                    [{ text: 'IVA', colSpan: 3, alignment: 'left', bold: true }, {}, {}, { text: `\$${order.iva}`, alignment: 'center', bold: true }],
                                    [{ text: 'Total', colSpan: 3, alignment: 'left', bold: true }, {}, {}, { text: `\$${order.total}`, alignment: 'center', bold: true }]
                                ]
                            },
                            border: [true, true, true, true],
                        }
                    ],
                    margin: [0, 0, 0, 20]
                }))
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    color : "#9ECA54",
                    margin: [0, 0, 0, 12],
                    font: 'Montserrat'
                },
                subheader: {
                    fontSize: 16,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 0, 0, 12],
                    font: 'Montserrat'
                },
                tableHeader: {
                    fontSize: 10, 
                    bold: true, 
                    color: '#2f2f2f', 
                    fillColor: '#e2e2e2', 
                    alignment: 'center'
                },
            },
            defaultStyle: {
                font: 'Montserrat'
            },
            background: function(currentPage, pageSize) {
                return {
                    image: logoBase64,
                    width: pageSize.width / 2,
                    height: pageSize.height / 2,
                    opacity: 0.1,
                    absolutePosition: { x: (pageSize.width - (pageSize.width / 2)) / 2, y: (pageSize.height - (pageSize.height / 2)) / 2 }
                };
            }
        };

        pdfMake.createPdf(docDefinition).getBuffer((buffer) => {
            resolve(buffer);
        });
    });
}


module.exports = generatePDF;
