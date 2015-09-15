var winston = require('winston');

/**
 * @function getLogger
 * @author Elias Nahum
 * @param module - El modulo desde donde se desea indicar que ocurrió el log
 * @returns {*} - retorna el logger de winston
 */
function getLogger(module) {
    var path = module.filename.split('/').slice(-2).join('/'); //using filename in log statements

    return new winston.Logger({
        transports: [
            new winston.transports.Console({
                colorize: true,
                level: 'debug',
                label: path
            })
        ]
    });
}

module.exports = getLogger;