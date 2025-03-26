class DownloadService {
  private readonly link: HTMLAnchorElement;

  constructor(url: string, name: string = 'template.xlsx') {
    this.link = document.createElement('a');
    this.link.href = url;
    this.link.download = name;
  }

  download() {
    if (typeof window === 'undefined') {
      // isServer
      console.log('This method must be run on the client side');
      return;
    }

    document.body.appendChild(this.link);
    this.link.click();
    document.body.removeChild(this.link);
  }
}
export default DownloadService;
