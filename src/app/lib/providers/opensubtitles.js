(function (App) {
    'use strict';
    var fetch = require('node-fetch');

    var OpenSubtitles = function () {

    };

    OpenSubtitles.prototype.constructor = OpenSubtitles;
    OpenSubtitles.prototype.config = {
        name: 'OpenSubtitles'
    };

    var normalizeLangCodes = function (data) {
        Object.keys(data).forEach(function(key,index) {
            if (key === 'pb' || key.indexOf('pb|') === 0) {
                data[key.replace('pb','pt-br')] = data[key];
                delete data[key];
            }
        });
        return data;
    };

    var formatForButter = function (data_obj) {
        var data = {};
        var multi_id = 0;
        var multi_langcode = '';
        var multi_urls = {};

        // formating subtitle object data to pre-multiple subtitle format
        for (const[langcode,value] of Object.entries(data_obj)) {
            multi_id = 1;
            multi_urls = {};
            value.forEach(function(subtitle) {
                // filtering out already existing urls
                if ( !(subtitle.url in multi_urls) ) {
                    multi_langcode = langcode;
                    if (multi_id > 1) {
                        // first subtitle without multi-subtitle format because of defaultSubtitle from settings
                        multi_langcode += '|' + multi_id.toString();
                    }
                    data[multi_langcode] = subtitle;
                    multi_urls[subtitle.url] = '';
                    multi_id++;
                }
            });
        }

        data = normalizeLangCodes(data);
        for (var lang in data) {
            data[lang] = data[lang].url;
        }

        win.info(Object.keys(data).length + ' subtitles found');

        return Common.sanitize(data);
    };

    OpenSubtitles.prototype.fetch = function (queryParams) {
        console.log('SubDL fetch called with:', queryParams);
        
        var apiKey = AdvSettings.get('subdlApiKey');
        if (!apiKey) {
            return Promise.reject(new Error('SubDL API key not configured'));
        }
        
        var lang = AdvSettings.get('subtitle_language');
        if (lang === 'none') {
            lang = 'EN';
        } else {
            // Convert to uppercase for SubDL API
            lang = lang.toUpperCase();
        }
        
        var imdbId = queryParams.imdbid;
        if (!imdbId) {
            return Promise.reject(new Error('IMDB ID required for SubDL'));
        }
        
        // Detect content type based on season/episode parameters
        var isTV = queryParams.season && queryParams.episode;
        var contentType = isTV ? 'tv' : 'movie';
        
        var url = 'https://api.subdl.com/api/v1/subtitles?api_key=' + apiKey + 
                  '&imdb_id=' + imdbId + 
                  '&languages=' + lang + 
                  '&type=' + contentType;
        
        // Add season and episode for TV series
        if (isTV) {
            url += '&season_number=' + queryParams.season + '&episode_number=' + queryParams.episode;
        }
        
        console.log('SubDL API request (' + contentType + '):', url.replace(apiKey, '***'));
        
        return fetch(url, { 
            headers: { 
                'Accept': 'application/json' 
            }
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            console.log('SubDL API response:', data);
            
            if (!data.status || !data.results || !data.results.length || !data.subtitles || !data.subtitles.length) {
                throw new Error('No subtitles found');
            }
            
            var convertedData = {};
            
            data.subtitles.forEach(function(subtitle) {
                var langCode = subtitle.language || 'en';
                var zipUrl = 'https://dl.subdl.com' + subtitle.url;
                
                if (!convertedData[langCode]) {
                    convertedData[langCode] = [];
                }
                
                convertedData[langCode].push({
                    url: zipUrl,
                    langcode: langCode,
                    downloads: subtitle.download_count || 0,
                    score: subtitle.rating || 0
                });
            });
            
            return formatForButter(convertedData);
        })
        .catch(function(error) {
            console.error('SubDL API error:', error);
            throw error;
        });
    };

    OpenSubtitles.prototype.detail = function (id, attrs) {
        return this.fetch({
            imdbid: id
        }).then(function (data) {
            App.vent.trigger('update:subtitles', data);
            return {
                subtitle: data
            };
        });
    };

    OpenSubtitles.prototype.upload = function (queryParams) {
        // SubDL doesn't support uploading subtitles
        return Promise.reject(new Error('Upload functionality is not available with SubDL'));
    };

    App.Providers.install(OpenSubtitles);

})(window.App);
