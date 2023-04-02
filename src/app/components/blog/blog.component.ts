import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {

  @Input() blogContent:any;
  trimmedContent: string = '';

  constructor() { }

  ngOnInit(){
    this.trimBlogtextForCard();
  }

  trimBlogtextForCard(){
    this.trimmedContent = this.blogContent.paras[0].slice(0,250);
    return this.trimmedContent;
  }

}
