(function () {
    if (!window.jQuery) {
        const script = document.createElement('script');
        script.src = "https://code.jquery.com/jquery-3.7.1.min.js";
        script.onload = init;
        document.head.appendChild(script);
    } else {
        init();
    }

    function init() {

        const classes = {
            appendLocation: 'ins-api-users'
        }

        const selectors = {
            appendLocation: `.${ classes.appendLocation }`
        }

        const appendLocation = selectors.appendLocation;

        const config = {
            attributes: true,
            childList: true,
            subtree: true,
            characterData: true
        }

        {}

        const observer = new MutationObserver((mutations) => {
            console.log(mutations);
            mutations.forEach(mutations => {
                if (mutations.type === "childList") {
                    mutations.removedNodes.forEach(node => {
                        if (node.nodeType === 1 && node.classList.contains("user-card")) {                            
                            if($('.user-card').length === 0) {
                                const hasReloaded = sessionStorage.getItem("hasReloaded");
                                if (!hasReloaded) {
                                    showReloadButton();
                                }
                            }
                        }
                    });
                }
            });
        });


        const makeCSS = () => {
            const style = `
                body {
                    font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
                    background-color: #f0f2f5;
                    margin: 0;
                    padding: 30px;
                    color: #333;
                }

                ${ selectors.appendLocation } {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 30px;
                    justify-content: center;
                    align-items: stretch;
                }

                .user-card {
                    background-color: #fff;
                    padding: 24px 20px 20px 20px;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    width: 280px;
                    position: relative;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }

                .user-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
                }

                .delete-btn {
                    border: none;
                    background: none;
                    position: absolute;
                    right: 16px;
                    top: 16px;
                    font-size: 18px;
                    cursor: pointer;
                    color: #999;
                    transition: color 0.2s ease;
                }

                .delete-btn:hover {
                    color: #e74c3c;
                }

                .user-name {
                    font-size: 20px;
                    margin: 0 0 10px;
                    color: #2c3e50;
                }

                .user-email {
                    font-size: 14px;
                    margin: 0 0 8px;
                    color: #7f8c8d;
                }

                .user-address {
                    font-size: 13px;
                    color: #555;
                    margin-bottom: 12px;
                    line-height: 1.5;
                }

                .user-card a {
                    display: inline-block;
                    font-size: 14px;
                    color: #3498db;
                    text-decoration: none;
                    margin-top: 6px;
                }

                .user-card a:hover {
                    text-decoration: underline;
                }

                #reload-btn {
                    border: none;
                    background-color: #8b5cf6;
                    padding: 10px 40px;
                    border-radius: 8px;
                    color: white;
                }
            `;
            $('<style>').text(style).appendTo('head');
        };

        const prepareDOM = () => {
            if (!$(appendLocation).length) {
                const container = $(`<div class="${classes.appendLocation}"></div>`);
                $('body').append(container);
            }
        };

        const saveLocalStorage = (data) => {
            const obj = {
                data: data,
                timestamp: Date.now()
            };
            localStorage.setItem("userList", JSON.stringify(obj));
        };

        const showUsers = (data) => {
            $(appendLocation).empty();
            data.forEach(user => {
                const html = `
                    <div class="user-card">
                        <button class="delete-btn">❌</button>
                        <h3 class="user-name">${user.name}</h3>
                        <p class="user-email">${user.email}</p>
                        <p class="user-address">
                            ${user.address.street}, ${user.address.suite}<br>
                            ${user.address.city}, ${user.address.zipcode}
                        </p>
                        <a href="http://${user.website}" target="_blank">${user.website}</a>
                    </div>
                `;
                $(appendLocation).append(html);
            });
        };

        const getData = () => {
            const userList = localStorage.getItem("userList");

            if (userList) {
                const parsed = JSON.parse(userList);
                const now = Date.now();
                const oneDay = 24 * 60 * 60 * 1000;

                if (now - parsed.timestamp < oneDay) {
                    showUsers(parsed.data);
                    return;
                }
            }

            fetch("https://jsonplaceholder.typicode.com/users")
                .then(response => {
                    if (!response.ok) throw new Error("Sunucu Hatası");
                    return response.json();
                })
                .then(data => {
                    showUsers(data);
                    saveLocalStorage(data);
                })
                .catch(error => {
                    alert("Bir hata oluştu: " + error.message);
                });
        };

        $(document).on('click', '.delete-btn', function () {
            const card = $(this).closest('.user-card');
            const name = card.find('.user-name').text().trim();
            card.remove();

            const storedData = JSON.parse(localStorage.getItem("userList"));
            if (storedData?.data) {
                const newData = storedData.data.filter(user => user.name !== name);
                const updatedObj = {
                    data: newData,
                    timestamp: storedData.timestamp
                };
                localStorage.setItem("userList", JSON.stringify(updatedObj));
            }
        });

        const showReloadButton = () => {
            if (sessionStorage.getItem("hasReloaded") === "true") return;
            $(appendLocation).empty();
            const html = `
                <button id="reload-btn">Yeniden Yükle</button>
            `;
            $(appendLocation).html(html);
        }

        $(document).on('click', '#reload-btn', function() {
            sessionStorage.setItem("hasReloaded", "true");
            localStorage.removeItem("userList");
            getData()
        });

        $(function () {
            makeCSS();
            prepareDOM();
            const watchedElement = document.querySelector(appendLocation);
            observer.observe(watchedElement, config)
            getData();
        });
    }
})();
