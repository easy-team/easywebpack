/* eslint-disable node/callback-return */
'use strict';

const url = require('url');

function evaluateRewriteRule(parsedUrl, match, rule) {
  if (typeof rule === 'string') {
    return rule;
  }
  if (typeof rule !== 'function') {
    throw new Error('Rewrite rule can only be of type string of function.');
  }

  return rule({
    parsedUrl,
    match
  });
}

function acceptsHtml(header) {
  return header.indexOf('text/html') !== -1 || header.indexOf('*/*') !== -1;
}

function getLogger(options) {
  if (options && options.logger) {
    return options.logger;
  }
  if (options && options.verbose) {
    return console.log.bind(console);
  }
  return function() { };
}

module.exports = function koaFallbackApiMiddleware(options) {
  options = options || {};
  const logger = getLogger(options);

  return async function(ctx, next) {
    const headers = ctx.headers,
      reqUrl = ctx.url,
      method = ctx.method;

    if (ctx.method !== 'GET') {
      logger(
        'Not rewriting',
        method,
        reqUrl,
        'because the method is not GET.'
      );
      return await next();
    }
    if (!headers || typeof headers.accept !== 'string') {
      logger(
        'Not rewriting',
        method,
        reqUrl,
        'because the client did not send an HTTP accept header.'
      );
      return await next();
    }
    if (headers.accept.indexOf('application/json') === 0) {
      logger(
        'Not rewriting',
        method,
        reqUrl,
        'because the client prefers JSON.'
      );
      return await next();
    }
    if (!acceptsHtml(headers.accept)) {
      logger(
        'Not rewriting',
        method,
        reqUrl,
        'because the client does not accept HTML.'
      );
      return await next();
    }

    // eslint-disable-next-line node/no-deprecated-api
    const parsedUrl = url.parse(reqUrl);
    let rewriteTarget;

    options.rewrites = options.rewrites || [];

    for (let i = 0; i < options.rewrites.length; i++) {
      const rewrite = options.rewrites[i];
      const match = parsedUrl.pathname.match(rewrite.from);
      if (match !== null) {
        rewriteTarget = evaluateRewriteRule(parsedUrl, match, rewrite.to);
        logger('Rewriting', method, reqUrl, 'to', rewriteTarget);
        ctx.url = rewriteTarget;
        return await next();
      }
    }

    if (parsedUrl.pathname.indexOf('.') !== -1) {
      logger(
        'Not rewriting',
        method,
        reqUrl,
        'because the path includes a dot (.) character.'
      );
      return await next();
    }

    rewriteTarget = options.index || '/index.html';
    logger('Rewriting', method, reqUrl, 'to', rewriteTarget);
    ctx.url = rewriteTarget;

    await next();
  };
};