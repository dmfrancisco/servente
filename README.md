<img width="370" height="70" src="./logo.svg" alt="Servente logo">

This is a small experiment that mimics a basic static HTTP server for viewing local files or a single page application. It is itself also only composed of static files and runs entirely on the browser.

## Introduction

A static web server is an HTTP server (software) that sends files that exist in the computer where it's running as-is to your browser, as opposed to a dynamic web server that uses additional code to generate new files or manipulate existing ones.

Static content are the files that you have on disk and that are sent to the browser, such as HTML, CSS, JavaScript and image files.

## Purpose of this project

While developing a site locally on your computer you may run into the limitations or security restrictions of the file URI scheme (`file://`). For example, if you manually created HTML files or if you are previewing the output of the build process of a tool such as [Create React App](https://create-react-app.dev/) or [Svelte Kit](https://kit.svelte.dev/) (with the static adapter) you may run into issues loading some content (assets) due to absolute paths. You may also run into CORS (Cross-Origin Resource Sharing) errors making requests, using canvases or other APIs in some browsers, such as Chrome.

The most common solution is to run a static server. If you have [node.js and npm](https://nodejs.org/en/download/) installed there are packages, such as [Serve](https://github.com/vercel/serve) by Vercel, that you can use by running `npx serve`. There are also many more options from other programming languages as you can see [here](https://gist.github.com/willurd/5720255). Those are all good solutions because these are real, HTTP servers.

Servente can be used for the same purpose and doesn't require knowing how to use command line or installing additional programs. But keep in mind that it's just a fun experiment with limitations (it uses an API that, at the moment, only works in some [Chromium-based browsers](<https://en.wikipedia.org/wiki/Chromium_(web_browser)#Browsers_based_on_Chromium>)). A more robust alternative for beginners can be this [Chrome Web Extension](https://github.com/kzahel/web-server-chrome).

## How it works

The user is asked to grant access to a folder in disk via the File System Access API. The list of files and directories is kept in memory and a Service Worker is registered to handle all local requests. If one of those requests matches a file in the list, then the contents of that file are read and return.

All GET requests are handled by the service worker, so if the directory you opened has an `index.html` file, then the root page of `servente.pages.dev` will become that page. To get back to the page with the button that allows you to open a folder, visit a path that results in a 404, such as `/servente`.
