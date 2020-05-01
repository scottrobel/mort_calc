//add jquery JS
function addJqueryToPage(){
    var script = document.createElement('script');
    script.src = 'https://code.jquery.com/jquery-3.4.1.min.js';
    script.type = 'text/javascript';
    document.getElementsByTagName('head')[0].appendChild(script);
    return script;
}
function firstPage(){
    return new Promise(function(resolve, reject){
        $.ajax({
                url: "/b",
                dataType: "html",
                success: function (data) {
                    resolve(data);
                }
        })    
    })
}
function getCatalog(){
    return new Promise(function(resolve, reject){
        $.ajax({
                url: "https://a.4cdn.org/b/catalog.json",
                dataType: "html",
                success: function (data) {
                    resolve(data);
                }
        })    
    })
}
function getPostCodes(data){
    return new Promise(
        function(resolve, reject){
            try {
                parsedData = JSON.parse(data)
                resolve(getThreadNumbers(parsedData))
            }
            catch(err) {
                reject('ERROR THROWN')
            }
        }
    )
}
function getThreadNumbers(pages){
    function compare(a, b) {
        if (a['replies'] < b['replies']) {
          return -1;
        }
        if (a['replies'] > b['replies']) {
          return 1;
        }
        // a must be equal to b
        return 0;
    }
    ThreadArray = []
    pages.forEach(function(page){
        ThreadArray = ThreadArray.concat(page['threads'])
    })
    ThreadArray =  ThreadArray.sort(compare)
    ThreadNumberArray = []
    ThreadArray.forEach(function(page){
        ThreadNumberArray.push(page['no'])
    })
    return ThreadNumberArray;
}
function getThreadAjaxPromises(postCodes){
    return new Promise(function(resolve, reject){
        threadPromises = []
        postCodes.forEach(postCode => {
            threadPromises.push(new Promise(function(resolve, reject){
                $.ajax({
                    url: `/b/thread/${postCode}`,
                    dataType: "html",
                    success: function (data) {
                        resolve(data);
                    },
                    error: function(){
                        reject(0)
                    }
                }) 
            }))
        });
        resolve(threadPromises);
    })
}
function highestGetCode(data){
    allPostLinks = $(data).find("a[title='Reply to this post']");
    return allPostLinks.last().text()
}
function getPostNumbersFromThreads(threadArray){
    return new Promise(
        function(resolve, reject){
            ThreadValues = threadArray.map(function(ThreadHash){
                return ThreadHash['value'];
            })
            postNumberArray = []
            ThreadValues.forEach(function(thread){
                postNumberArray.push(highestGetCode(thread))
            })
            var max = postNumberArray.reduce(function(a, b) {
                return Math.max(a, b);
            });
            resolve(max)
        }
    )    

}
function getHighestofAllThreads(promiseArray){
    return Promise.allSettled(promiseArray)
}
function startDelayedProcess(){
    setTimeout(function(){
        attachPromises();
    },50)
}
function attachPromises(){
    
    threadPromises = getCatalog()
                    .then(getPostCodes)
                    .then(getThreadAjaxPromises)
                    .then(getHighestofAllThreads)
                    .then(getPostNumbersFromThreads)
                    .then(startDelayedProcess)
                    .catch(startDelayedProcess)
}   
script = addJqueryToPage();
script.addEventListener('load', attachPromises)
//Avoid Promise.all