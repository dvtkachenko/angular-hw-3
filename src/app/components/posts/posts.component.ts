import { NgForm } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { PostsService } from '../../services/posts.service';
import { Post } from '../../models/post.model';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommentsService } from '../../services/comments.service';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css']
})
export class PostsComponent implements OnInit {

  public newPost: Post;

  public posts: Post[];

  public isAdmin = true;

  constructor(private postsService: PostsService,
    private commentsService: CommentsService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService) { }

  ngOnInit() {

    this.newPost = new Post();

    this.spinner.show();

    this.postsService.getPosts()
      .subscribe((request: Post[]) => {
        this.posts = request;
        this.spinner.hide();
        console.log("PostsComponent -> ngOnInit -> fetched posts : ", request);
      },
        error => { 
          this.spinner.hide();
          console.error("PostsComponent -> ngOnInit -> error fetching posts from server.", error.message) 
        }
      );
  }

  public getPostComments(post: Post) {

    if (post.comments) {
      post.comments = null;
    } else {

      this.spinner.show();

      this.commentsService.getComments(post.id)
        .subscribe((request: Comment[]) => {
          post.comments = request;
          this.spinner.hide();
          console.log("PostsComponent -> getPostComments -> post comments with id: ", post.id, " was fetched. ", request);
        },
          error => {
            this.spinner.hide();
            this.toastr.error("Can not fetch comments from server", "Error", { timeOut: 3000 });
            console.error("PostsComponent -> getPostComments -> post comments with id: ",
              post.id, " was not fetched. ", error.message)
          }
        );
    }
  }

  public onDelete(post: Post) {

    this.spinner.show();

    this.postsService.deletePost(post.id)
      .subscribe((data: Object) => {
        this.posts = this.posts.filter(filteredPost => filteredPost.id != post.id);
        this.spinner.hide();
        this.toastr.success("Post was successfully deleted", "Info", { timeOut: 3000 });
        console.log("PostsComponent -> onDelete -> post with id: ", post.id, " was deleted. ", data);
      },
        error => {
          this.spinner.hide();
          this.toastr.error("Post was not deleted", "Error", { timeOut: 3000 });
          console.error("PostsComponent -> onDelete -> post with id: ", post.id, " was not deleted. ", error.message)
        }
      );
  }

  onSubmit(form: NgForm) {

    if (form.invalid) return;

    this.spinner.show();

    let clonedPost: Post = {
      userId: this.newPost.userId,
      title: this.newPost.title,
      body: this.newPost.body
    }

    this.postsService.createPost(clonedPost)
      .subscribe((request: Post) => {
        clonedPost.id = request.id;
        this.posts.push(clonedPost);
        form.resetForm();
        this.spinner.hide();
        this.toastr.success("New post was successfully created", "Info", { timeOut: 3000 });
        console.log("PostsComponent -> onSubmit -> new post was created on server. ", request);
      },
        error => {
          this.spinner.hide();
          this.toastr.error("New post was not created", "Error", { timeOut: 3000 });
          console.error("PostsComponent -> onSubmit -> error creating new post on server. ", error.message);
        }
      );
  }
}
