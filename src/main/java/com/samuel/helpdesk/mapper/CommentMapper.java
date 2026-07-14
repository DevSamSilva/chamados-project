package com.samuel.helpdesk.mapper;

import com.samuel.helpdesk.dto.CommentResponse;
import com.samuel.helpdesk.entity.Comment;

public class CommentMapper {

    public static CommentResponse toResponse(Comment comment) {
        return new CommentResponse(
            comment.getId(),
            comment.getConteudo(),
            comment.getTicket().getId(),
            comment.getUsuario().getId(),
            comment.getUsuario().getNome(),
            comment.getDataCriacao()
        );
    }
}
