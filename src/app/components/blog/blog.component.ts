import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {

  @Input() blogContent:any;
  constructor() { }

  ngOnInit(){
    //console.log(this.blogContent, 'blog')
  }

}
