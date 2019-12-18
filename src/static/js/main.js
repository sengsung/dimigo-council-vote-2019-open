// document.documentElement.requestFullscreen();
$(function () {
  $('.login-form').submit(function (event) {
    event.preventDefault();
    var id = $('.login-form__id').val();
    var password = $('.login-form__password').val()
    if (!id || !password) {
      alert('아이디 또는 비밀번호가 입력되지 않았어요!');
      return;
    }
    $.post(
      '/auth', { id, password },
      function (data) {
        switch (data.code) {
          case 200:
            $.cookie('dimi_hash', data.hash);
            window.location.replace('/vote.html');
            break;
          case 404:
            alert('아이디와 비밀번호를 확인해주세요!');
            break;
          case 500:
            alert('서버 에러 발생');
            break;
          case 403:
            alert('재학생만 로그인이 가능합니다!');
            break;
          case 400:
            alert('아이디와 비밀번호를 입력해주세요!');
            break;
        }
      }, "json").fail(function (data) {
        console.log(data.responseJSON.msg)
      });
  });

  $('.login-form-hash').submit(function (event) {
    event.preventDefault();
    var hash = $('#hash').val().trim();
    if (!hash) {
      alert('개인 코드가 입력되지 않았어요!');
      return;
    }
    if (hash.length !== 6) {
      alert('개인 코드를 확인해주세요!');
      return;
    }
    $.post(
      '/auth/hash', { hash },
      function (data) {
        switch (data.code) {
          case 200:
            $.cookie('dimi_hash', hash);
            window.location.replace('/vote.html');
            break;
          case 404:
            alert('개인 코드를 확인해주세요!');
            break;
          case 400:
            alert('개인 코드를 입력해주세요!');
            break;
          case 500:
            alert('서버 에러 발생');
            break;
        }
      }
    )
  });
});

function switchId() {
  document.querySelector('.login-form-hash').style.display = 'none';
  document.querySelector('.login-form').style.display = 'flex';
}

function switchHash() {
  document.querySelector('.login-form-hash').style.display = 'flex';
  document.querySelector('.login-form').style.display = 'none';
}