export default {
  theme: 'bubble',
  modules: {
    toolbar: {
      container: [
        ['bold', 'italic', 'code'],
        ['blockquote', 'code-block'],
        [{list: 'ordered'}, {list: 'bullet'}],
        [{header: [1, 2, 3, false]}],
        ['link', 'image', 'video']
      ]
    }
  }
}
