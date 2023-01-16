export default {
  theme: 'bubble',
  modules: {
    toolbar: {
      container: [
        ['bold', 'italic', {background: [false, '#f06666', '#ffc266', '#ffff66', '#66b966', '#66a3e0', '#c285ff']}],
        [{list: 'ordered'}, {list: 'bullet'}],
        ['link', 'image', 'video'],
        [{header: [1, 2, 3, false]}]
      ]
    }
  }
}
